-- Migration number: 0003

-- Create the ApiTokens table
CREATE TABLE IF NOT EXISTS ApiTokens (
    TokenId INTEGER PRIMARY KEY AUTOINCREMENT,
    TokenName TEXT NOT NULL,
    HashedToken TEXT NOT NULL UNIQUE, -- Store only the hash of the token, ensure uniqueness
    UserId TEXT NOT NULL,             -- User ID from the authentication provider
    CreatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Store creation time
    ExpiresAt TEXT -- Store expiration time
);

-- Optional: Add an index on UserId for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_tokens_user_id ON ApiTokens(UserId);
