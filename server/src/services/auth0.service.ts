import { Env } from '../types/env.types';

interface ManagementApiToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

let token: ManagementApiToken | null = null;
let tokenExpiresAt: number | null = null;

export class Auth0Service {
  constructor(private env: Env) {}

  private async fetchNewToken(): Promise<ManagementApiToken> {
    const response = await fetch(`https://${this.env.AUTH0_MANAGEMENT_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: this.env.AUTH0_MANAGEMENT_CLIENT_ID,
        client_secret: this.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
        audience: `https://${this.env.AUTH0_MANAGEMENT_DOMAIN}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch Auth0 Management API token: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const newToken = await response.json() as ManagementApiToken;
    token = newToken;
    // Store expiry with a 60 second buffer to account for clock differences and request latency
    tokenExpiresAt = Date.now() + (newToken.expires_in - 60) * 1000; 
    return newToken;
  }

  async getManagementApiToken(): Promise<string> {
    if (token && tokenExpiresAt && Date.now() < tokenExpiresAt) {
      return token.access_token;
    }
    const newToken = await this.fetchNewToken();
    return newToken.access_token;
  }

  async request<T>(endpoint: string, method: string = 'GET', body?: unknown): Promise<T> {
    const accessToken = await this.getManagementApiToken();
    const url = `https://${this.env.AUTH0_MANAGEMENT_DOMAIN}/api/v2/${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Auth0 Management API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    if (response.status === 204) { // No Content
        return undefined as T;
    }

    return response.json() as T;
  }
}
