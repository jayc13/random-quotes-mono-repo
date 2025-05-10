-- Migration number: 0004

-- Add ExpiresAt column to ApiTokens table
ALTER TABLE ApiTokens
    ADD COLUMN ExpiresAt TEXT; -- Store expiration time

-- Update existing tokens to have no expiration (NULL means no expiration)
-- No action needed as new column will default to NULL for existing rows