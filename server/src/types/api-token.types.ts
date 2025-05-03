// Defines the structure of an API token stored in the database
export interface ApiTokenRecord {
  id: number;
  name: string;
  hashedToken: string; // Only the hash is stored
  userId: string; // User ID from the authentication provider (e.g., Auth0 sub)
  createdAt: string; // ISO 8601 timestamp
}

// Defines the structure returned when *creating* a token (includes plain text token)
export interface NewApiToken extends ApiTokenRecord {
  token: string; // The actual plain text token (only available on creation)
}

// Defines the structure for listing tokens (omits the hash)
export interface ApiTokenInfo {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
}

// Defines the input structure for creating a new token
export interface ApiTokenInput {
  name: string;
}
