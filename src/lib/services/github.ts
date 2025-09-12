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

    const data = await response.json();

    if (!response.ok) {
      const error = data as GitHubError;
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return data;
  }

  async getUserByUsername(username: string): Promise<GitHubUser | null> {
    try {
      const user = await this.makeGitHubRequest(`/users/${username}`);
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      console.error('Error fetching GitHub user:', error);
      return null;
    }
  }

  async isUserInOrganization(username: string): Promise<boolean> {
    try {
      await this.makeGitHubRequest(`/orgs/${this.org}/members/${username}`);
      return true;
    } catch {
      return false;
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