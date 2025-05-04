import type {
  ApiTokenInfo,
  ApiTokenInput,
  ApiTokenRecord,
  NewApiToken,
} from "@/types/api-token.types";

// Helper function to generate a secure random token string
// Note: In a real Cloudflare Worker environment, use crypto.randomUUID() or SubtleCrypto
function generateSecureToken(length = 32): string {
  // Simple pseudo-random generation for demonstration. Replace with secure method.
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `qtk_${result}`; // Add a prefix for identification
}

// Helper function to hash the token using SHA-256
// Note: Requires SubtleCrypto API available in Workers
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  // convert bytes to hex string
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Validate the input for creating a token
export const validateApiTokenInput = (input: ApiTokenInput): boolean => {
  return !(!input || !input.name || input.name.trim().length === 0);
};

/**
 * Generates a new API token, hashes it, stores it in the database,
 * and returns the new token record including the plain text token.
 */
export const generateApiToken = async (
  db: D1Database,
  userId: string,
  input: ApiTokenInput,
): Promise<NewApiToken> => {
  if (!validateApiTokenInput(input)) {
    throw new Error("Invalid API token input: Name is required.");
  }
  const { name } = input;
  const plainTextToken = generateSecureToken();
  const hashedToken = await hashToken(plainTextToken);
  const createdAt = new Date().toISOString();

  // Corrected column names to match the SQL migration
  const result = await db
    .prepare(
      "INSERT INTO ApiTokens (TokenName, HashedToken, UserId, CreatedAt) VALUES (?, ?, ?, ?)",
    )
    .bind(name, hashedToken, userId, createdAt)
    .run();

  const id: number = result.meta.last_row_id as number;

  if (!id) {
    throw new Error(
      "Failed to create API token: Could not retrieve last row ID.",
    );
  }

  // Return the full record including the plain text token
  return {
    id,
    name,
    userId,
    createdAt,
    token: plainTextToken, // The actual token to show the user ONCE
  };
};

/**
 * Deletes an API token by its ID, ensuring the user owns the token.
 */
export const deleteApiToken = async (
  db: D1Database,
  userId: string,
  tokenId: number,
): Promise<boolean> => {
  // Corrected column name to match the SQL migration
  // Verify the token exists and belongs to the user before deleting
  const existingToken = await db
    .prepare("SELECT TokenId FROM ApiTokens WHERE TokenId = ? AND UserId = ?")
    .bind(tokenId, userId)
    .first();

  if (!existingToken) {
    // Either token doesn't exist or doesn't belong to the user
    // Return false or throw an error depending on desired behavior (e.g., 404 vs 403)
    console.warn(
      `Attempt to delete non-existent or unauthorized token ID: ${tokenId} by user: ${userId}`,
    );
    return false; // Indicate deletion did not happen
  }

  // Corrected column name to match the SQL migration
  const result = await db
    .prepare("DELETE FROM ApiTokens WHERE TokenId = ? AND UserId = ?")
    .bind(tokenId, userId)
    .run();

  return result.success;
};

/**
 * Retrieves all API tokens (excluding the hash) for a specific user.
 */
export const getUserApiTokens = async (
  db: D1Database,
  userId: string,
): Promise<ApiTokenInfo[]> => {
  // Corrected column names to match the SQL migration
  const { results } = await db
    .prepare(
      "SELECT TokenId, TokenName, UserId, CreatedAt FROM ApiTokens WHERE UserId = ? ORDER BY CreatedAt DESC",
    )
    .bind(userId)
    .all<ApiTokenRecord>(); // Fetch records matching the DB structure

  if (!results) {
    return [];
  }

  // Map to ApiTokenInfo, excluding the HashedToken
  // Ensure the mapping uses the correct column names from the D1 result
  return results.map((r) => ({
    id: r.TokenId, // Map TokenId from DB to id in the TS object
    name: r.TokenName, // Map TokenName from DB to name
    userId: r.UserId, // Map UserId from DB to userId
    createdAt: r.CreatedAt, // Map CreatedAt from DB to createdAt
  }));
};
