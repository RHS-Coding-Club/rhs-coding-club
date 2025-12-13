// GitHub service for handling organization operations
import { lookup } from 'node:dns/promises';
import type { LookupAddress } from 'node:dns';
import { isIP } from 'node:net';

interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
}

interface GitHubError {
  message: string;
  documentation_url?: string;
}

interface GitHubOrgInvitation {
  id: number;
  login?: string; // Some invitation objects may not include login directly
  invitee?: { login?: string };
}

class GitHubApiError extends Error {
  status: number;
  documentationUrl?: string;

  constructor(message: string, status: number, documentationUrl?: string) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.documentationUrl = documentationUrl;
  }
}

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_USER_AGENT = 'RHS-Coding-Club-App';

// Explicit allowlist: only GitHub API host is permitted.
// If you ever add more outbound destinations, add them here (do not make it configurable from user input).
const ALLOWED_HOSTS = new Set(['api.github.com']);

// Cloud metadata endpoints that MUST be blocked, even if reached via DNS rebinding.
const BLOCKED_METADATA_HOSTNAMES = new Set([
  'metadata.google.internal',
  'metadata',
  'instance-data',
  '169.254.169.254',
  '169.254.170.2',
  '100.100.100.200',
]);

const DNS_VALIDATION_TTL_MS = 10 * 60 * 1000;
const dnsValidationCache = new Map<string, number>();

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Operation timed out')), ms);
    }),
  ]).finally(() => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  });
}

function isValidGitHubUsername(value: string): boolean {
  // GitHub usernames: 1-39 chars, alnum or single dashes not at ends / not consecutive
  // https://github.com/shinnn/github-username-regex
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(value);
}

function isValidGitHubOrg(value: string): boolean {
  // Organization names share the same visible constraints as usernames.
  return isValidGitHubUsername(value);
}

function ipv4ToInt(ip: string): number {
  const parts = ip.split('.').map((p) => Number(p));
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function isIpv4InCidr(ip: string, cidrBase: string, cidrMaskBits: number): boolean {
  const mask = cidrMaskBits === 0 ? 0 : (0xffffffff << (32 - cidrMaskBits)) >>> 0;
  const ipInt = ipv4ToInt(ip);
  const baseInt = ipv4ToInt(cidrBase);
  return (ipInt & mask) === (baseInt & mask);
}

function isBlockedIpAddress(ip: string): boolean {
  const ipVersion = isIP(ip);
  if (ipVersion === 4) {
    // RFC1918 + loopback + link-local + CGNAT + multicast + 0.0.0.0/8
    if (isIpv4InCidr(ip, '10.0.0.0', 8)) return true;
    if (isIpv4InCidr(ip, '127.0.0.0', 8)) return true;
    if (isIpv4InCidr(ip, '169.254.0.0', 16)) return true;
    if (isIpv4InCidr(ip, '172.16.0.0', 12)) return true;
    if (isIpv4InCidr(ip, '192.168.0.0', 16)) return true;
    if (isIpv4InCidr(ip, '100.64.0.0', 10)) return true;
    if (isIpv4InCidr(ip, '0.0.0.0', 8)) return true;
    if (isIpv4InCidr(ip, '224.0.0.0', 4)) return true;
    // Explicit metadata IPs (defense in depth)
    if (ip === '169.254.169.254' || ip === '169.254.170.2' || ip === '100.100.100.200') return true;
    return false;
  }

  if (ipVersion === 6) {
    const normalized = ip.toLowerCase();

    const v4MappedDotted = normalized.match(/^::ffff:(?:0:)?(\d{1,3}(?:\.\d{1,3}){3})$/);
    if (v4MappedDotted) {
      return isBlockedIpAddress(v4MappedDotted[1]);
    }

    const v4MappedHex = normalized.match(/^::ffff:(?:0:)?([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (v4MappedHex) {
      const high = parseInt(v4MappedHex[1], 16);
      const low = parseInt(v4MappedHex[2], 16);
      if (!Number.isFinite(high) || !Number.isFinite(low)) return true;
      if (high < 0 || high > 0xffff || low < 0 || low > 0xffff) return true;
      const a = (high >> 8) & 0xff;
      const b = high & 0xff;
      const c = (low >> 8) & 0xff;
      const d = low & 0xff;
      return isBlockedIpAddress(`${a}.${b}.${c}.${d}`);
    }

    // Loopback / unspecified
    if (normalized === '::1' || normalized === '::') return true;
    // Unique-local fc00::/7
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // Link-local fe80::/10
    if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
    return false;
  }

  // If it doesn't parse as an IP, treat as blocked at this layer.
  return true;
}

async function validateHostIsSafe(hostname: string): Promise<void> {
  const host = hostname.toLowerCase();

  if (BLOCKED_METADATA_HOSTNAMES.has(host)) {
    throw new Error('Blocked destination');
  }
  if (host === 'localhost') {
    throw new Error('Blocked destination');
  }

  // If hostname is already an IP literal, validate directly.
  if (isIP(host)) {
    if (isBlockedIpAddress(host)) {
      throw new Error('Blocked destination');
    }
    return;
  }

  const cachedAt = dnsValidationCache.get(host);
  if (cachedAt && Date.now() - cachedAt < DNS_VALIDATION_TTL_MS) {
    return;
  }

  // DNS resolve all A/AAAA records and block if any resolve to a private/metadata range.
  // This mitigates DNS rebinding attacks.
  let results: LookupAddress[];
  try {
    results = await withTimeout<LookupAddress[]>(
      lookup(host, { all: true, verbatim: true }) as Promise<LookupAddress[]>,
      5000
    );
  } catch {
    throw new Error('Blocked destination');
  }
  if (!results || results.length === 0) {
    throw new Error('Blocked destination');
  }

  for (const record of results) {
    if (isBlockedIpAddress(record.address)) {
      throw new Error('Blocked destination');
    }
  }

  dnsValidationCache.set(host, Date.now());
}

function buildSafeUrl(base: string, endpoint: string): URL {
  // Prevent absolute URLs / protocol-relative URLs from overriding the allowlisted host.
  if (!endpoint.startsWith('/') || endpoint.startsWith('//')) {
    throw new Error('Invalid endpoint');
  }
  // Reject any scheme-looking prefix just in case (e.g., "http:..." in odd contexts).
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(endpoint)) {
    throw new Error('Invalid endpoint');
  }
  const url = new URL(endpoint, base);
  if (url.protocol !== 'https:') {
    throw new Error('Blocked destination');
  }
  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error('Blocked destination');
  }
  return url;
}

export class GitHubService {
  private token: string;
  private org: string;

  constructor() {
    this.token = process.env.GITHUB_TOKEN || '';
    this.org = process.env.GITHUB_ORG || '';
    
    if (!this.token) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }
    
    if (!this.org) {
      throw new Error('GITHUB_ORG environment variable is required');
    }

    if (!isValidGitHubOrg(this.org)) {
      throw new Error('GITHUB_ORG is not a valid GitHub organization name');
    }
  }

  /**
   * Low-level, SSRF-hardened request primitive.
   * Returns the raw Response so callers can inspect status codes (e.g. 204/404 endpoints).
   */
  private async makeGitHubResponse(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = buildSafeUrl(GITHUB_API_BASE_URL, endpoint);

    // Resolve and validate host/IP *before* the request to prevent SSRF via DNS tricks.
    await validateHostIsSafe(url.hostname);

    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': GITHUB_USER_AGENT,
        ...options.headers,
      },
    });
  }

  private async makeGitHubRequest(endpoint: string, options: RequestInit = {}) {
    const response = await this.makeGitHubResponse(endpoint, options);
    // Some endpoints (like membership existence endpoint) may return 204 No Content on success
    let data: unknown = null;
    if (response.status !== 204) {
      try {
        data = await response.json();
      } catch {
        // ignore JSON parse issues for empty bodies
        data = null;
      }
    }

    if (!response.ok) {
      const error = (data || {}) as GitHubError;
      throw new GitHubApiError(
        error.message || 'GitHub API error',
        response.status,
        typeof error.documentation_url === 'string' ? error.documentation_url : undefined
      );
    }

    return data;
  }

  async getUserByUsername(username: string): Promise<GitHubUser | null> {
    try {
      if (!isValidGitHubUsername(username)) return null;
      const userData = await this.makeGitHubRequest(`/users/${username}`);
      if (!userData || typeof userData !== 'object') return null;
      const user = userData as Record<string, unknown>;
      if (typeof user.id !== 'number' || typeof user.login !== 'string') return null;
      return {
        id: user.id,
        login: user.login,
        email: (typeof user.email === 'string' || user.email === null) ? (user.email as string | null) : null,
        name: (typeof user.name === 'string' || user.name === null) ? (user.name as string | null) : null,
      };
    } catch (error) {
      console.error('Error fetching GitHub user:', error);
      return null;
    }
  }

  async isUserInOrganization(username: string): Promise<boolean> {
    try {
      if (!isValidGitHubUsername(username)) return false;
      // GitHub returns 204 No Content for membership existence endpoint when user is a member
      const response = await this.makeGitHubResponse(`/orgs/${this.org}/members/${username}`);
      if (response.status === 204) return true; // definite member
      if (response.status === 404) return false; // not a member
      if (response.ok) return true; // fallback: some responses may be 200
      return false;
    } catch (error) {
      console.error(`Error checking membership for ${username}:`, error);
      return false;
    }
  }

  /**
   * Returns detailed membership state using the memberships endpoint.
   * Possible states: 'active', 'pending', 'inactive', 'none'
   */
  async getMembershipState(username: string): Promise<{ state: string; role?: string }> {
    try {
      if (!isValidGitHubUsername(username)) return { state: 'none' };
      const data = await this.makeGitHubRequest(`/orgs/${this.org}/memberships/${username}`);
      if (data && typeof data === 'object' && 'state' in data) {
        // Narrow the unknown "data" to the shape we expect from GitHub memberships endpoint
        const membership = data as { state: string; role?: string };
        return { state: membership.state, role: membership.role };
      }
      return { state: 'unknown' };
    } catch (error) {
      // 404 means no membership (not invited or invitation expired)
      if (error instanceof GitHubApiError && error.status === 404) {
        return { state: 'none' };
      }
      return { state: 'error' };
    }
  }

  async isUserInvitedToOrganization(username: string): Promise<boolean> {
    try {
      if (!isValidGitHubUsername(username)) return false;
      const invitations = await this.makeGitHubRequest(`/orgs/${this.org}/invitations`);
      if (!Array.isArray(invitations)) return false;
      return invitations.some((invite: GitHubOrgInvitation) => 
        invite.login === username || invite.invitee?.login === username
      );
    } catch {
      return false;
    }
  }

  async inviteUserToOrganization(username: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!isValidGitHubUsername(username)) {
        return { success: false, message: 'Invalid GitHub username format' };
      }

      const user = await this.getUserByUsername(username);
      if (!user) {
        return { success: false, message: 'GitHub user not found' };
      }

      await this.makeGitHubRequest(`/orgs/${this.org}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitee_id: user.id,
          role: 'direct_member',
        }),
      });

      return {
        success: true,
        message: `Successfully invited ${username} to the organization`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Failed to invite ${username}: ${message}`,
      };
    }
  }

  async checkRateLimit(): Promise<{ remaining: number; reset: number }> {
    try {
      const response = await this.makeGitHubResponse('/rate_limit', {
        headers: {
          'User-Agent': GITHUB_USER_AGENT,
        },
      });

      const data = await response.json();
      return {
        remaining: data.rate.remaining,
        reset: data.rate.reset,
      };
    } catch {
      return { remaining: 0, reset: Date.now() / 1000 + 3600 }; // Default to 1 hour
    }
  }
}

export const githubService = new GitHubService();