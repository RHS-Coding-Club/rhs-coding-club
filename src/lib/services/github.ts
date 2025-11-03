// GitHub service for handling organization operations
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
  }

  private async makeGitHubRequest(endpoint: string, options: RequestInit = {}) {
    const url = `https://api.github.com${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'RHS-Coding-Club-App',
        ...options.headers,
      },
    });
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
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return data;
  }

  async getUserByUsername(username: string): Promise<GitHubUser | null> {
    try {
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
      // GitHub returns 204 No Content for membership existence endpoint when user is a member
      const url = `https://api.github.com/orgs/${this.org}/members/${username}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'RHS-Coding-Club-App',
        },
      });
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
      const data = await this.makeGitHubRequest(`/orgs/${this.org}/memberships/${username}`);
      if (data && typeof data === 'object' && 'state' in data) {
        // Narrow the unknown "data" to the shape we expect from GitHub memberships endpoint
        const membership = data as { state: string; role?: string };
        return { state: membership.state, role: membership.role };
      }
      return { state: 'unknown' };
    } catch (error) {
      // 404 means no membership (not invited or invitation expired)
      if (error instanceof Error && /404/.test(error.message)) {
        return { state: 'none' };
      }
      return { state: 'error' };
    }
  }

  async isUserInvitedToOrganization(username: string): Promise<boolean> {
    try {
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
      await this.makeGitHubRequest(`/orgs/${this.org}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitee_id: (await this.getUserByUsername(username))?.id,
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
      const response = await fetch('https://api.github.com/rate_limit', {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
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