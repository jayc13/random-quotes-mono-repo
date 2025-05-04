// Defines the structure of an API token stored in the database
export interface ApiTokenRecord {
  TokenId: number;
  TokenName: string;
  HashedToken: string; // Only the hash is stored
  UserId: string; // User ID from the authentication provider (e.g., Auth0 sub)
  CreatedAt: string; // ISO 8601 timestamp
}

// Defines the structure for listing tokens (omits the hash)
export interface ApiTokenInfo {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
}

export interface NewApiToken extends ApiTokenInfo {
  token: string; // The actual plain text token (only available on creation)
}

// Defines the input structure for creating a new token
export interface ApiTokenInput {
  name: string;
}
