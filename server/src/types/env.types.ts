export interface Env {
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  AUTH0_CALLBACK_URL: string;
  AUTH0_LOGOUT_URL: string;
  SESSION_SECRET: string;
  D1_DB: D1Database;
  AUTH0_MANAGEMENT_DOMAIN: string;
  AUTH0_MANAGEMENT_CLIENT_ID: string;
  AUTH0_MANAGEMENT_CLIENT_SECRET: string;
  AUTH0_CONNECTION_ID?: string; // Optional: Auth0 connection ID for password reset
}
