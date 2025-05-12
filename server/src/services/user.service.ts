import type { D1Database } from '@cloudflare/workers-types';

// Interface for name parts, consistent with the controller
export interface NamePartsRequestBody {
  given_name?: string;
  family_name?: string;
  nickname?: string;
  name?: string; // Full name, potentially
}

// Placeholder for User type - this might need to be adjusted based on actual DB schema
// Assuming we'll fetch this from a central types file or define it more concretely later
export interface User {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  name?: string; // This could be a concatenation or a separate field
}

/**
 * Updates the name parts for a given user.
 * The Auth0 Management API is the source of truth for user profiles.
 * This function should ideally call the Auth0 Management API to update user_metadata or app_metadata.
 * For this example, we'll simulate updating records in a D1 table named 'Users'.
 */
export async function updateUserName(
  db: D1Database,
  userId: string,
  nameParts: NamePartsRequestBody,
): Promise<boolean> {
  // TODO: Determine actual database schema and table name for users.
  // This is a placeholder implementation.
  // Assuming a 'Users' table with columns like 'Auth0UserId', 'GivenName', 'FamilyName', 'Nickname', 'FullName'.

  const { given_name, family_name, nickname, name } = nameParts;
  let updateStatement = 'UPDATE Users SET ';
  const bindings = [];
  const setClauses = [];

  if (given_name !== undefined) {
    setClauses.push('GivenName = ?');
    bindings.push(given_name);
  }
  if (family_name !== undefined) {
    setClauses.push('FamilyName = ?');
    bindings.push(family_name);
  }
  if (nickname !== undefined) {
    setClauses.push('Nickname = ?');
    bindings.push(nickname);
  }
  if (name !== undefined) { // Assuming 'name' could be a fallback for 'FullName'
    setClauses.push('FullName = ?');
    bindings.push(name);
  }

  if (setClauses.length === 0) {
    console.log('No name parts provided to update for user:', userId);
    return false; // Or throw an error
  }

  updateStatement += setClauses.join(', ') + ' WHERE Auth0UserId = ?';
  bindings.push(userId);

  try {
    const stmt = db.prepare(updateStatement).bind(...bindings);
    const result = await stmt.run();
    console.log('Update result for user', userId, result);
    return result.success;
  } catch (e: any) {
    console.error('Error updating user name in D1:', e.message);
    // In a real app, you might want to check if the user exists first
    // or handle specific D1 errors.
    // For now, assume failure means the record might not exist or another issue.
    // Check if the error is due to 'no such table: Users'
    if (e.message?.includes('no such table')) {
        console.warn("Table 'Users' does not exist. Please ensure migrations are run.");
        // Attempt to create a dummy Users table for demonstration if it's a common issue during dev
        // This is NOT for production.
        // await db.exec("CREATE TABLE IF NOT EXISTS Users (Auth0UserId TEXT PRIMARY KEY, Email TEXT, GivenName TEXT, FamilyName TEXT, Nickname TEXT, FullName TEXT);");
        // console.log("Attempted to create Users table for dev purposes.");
    }
    return false;
  }
}

/**
 * Initiates the password reset process for a user.
 * This typically involves calling an authentication provider's API (e.g., Auth0).
 */
export async function sendForgotPasswordEmail(
  db: D1Database, // db might not be directly used if relying on Auth0
  userEmail: string,
  // Consider adding env: Env for Auth0 domain/client credentials
): Promise<boolean> {
  // TODO: Implement actual password reset email logic.
  // This would typically involve:
  // 1. Calling the Auth0 Management API to send a password reset email.
  //    - POST /api/v2/tickets/password-change
  //    - Requires Auth0 domain, client_id.
  // 2. For this example, we will just log the action.

  if (!userEmail) {
    console.error('sendForgotPasswordEmail: No email provided.');
    return false;
  }

  console.log(`Simulating sending password reset email to: ${userEmail}`);
  // In a real scenario, you would make an API call to Auth0 here.
  // Example:
  // const auth0Domain = env.AUTH0_DOMAIN;
  // const auth0ClientId = env.AUTH0_CLIENT_ID_MGMT_API_PW_RESET; // A specific M2M client for this
  // const response = await fetch(`https://${auth0Domain}/dbconnections/change_password`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     client_id: auth0ClientId,
  //     email: userEmail,
  //     connection: 'Username-Password-Authentication', // Or your specific DB connection
  //   }),
  // });
  // if (!response.ok) {
  //   const errorBody = await response.text();
  //   console.error('Failed to send password reset email via Auth0:', response.status, errorBody);
  //   return false;
  // }
  // console.log(`Password reset email request sent successfully for ${userEmail} via Auth0.`);
  return true; // Indicate success for now
}

/**
 * Deletes a user's account and all associated data, including API tokens.
 * This involves:
 * 1. Deleting the user from the primary user store (e.g., Auth0).
 * 2. Deleting related data from this application's database (e.g., API tokens in D1).
 */
export async function deleteUserAccount(
  db: D1Database,
  userId: string,
  // Consider adding env: Env for Auth0 credentials
): Promise<boolean> {
  // TODO: Implement actual user deletion logic.
  // This would involve:
  // 1. Calling Auth0 Management API to delete the user.
  //    - DELETE /api/v2/users/{id}
  //    - Requires appropriate Auth0 Management API token with delete:users scope.
  // 2. Deleting all API tokens for this user from D1. (This part is local)

  if (!userId) {
    console.error('deleteUserAccount: No userId provided.');
    return false;
  }

  console.log(`Attempting to delete user account: ${userId}`);

  // Step 1: Delete API tokens associated with the user (local D1 operation)
  try {
    // This function will be added to api-token.service.ts as per the plan
    // For now, let's assume it exists or put a placeholder SQL here.
    // import { deleteAllApiTokensForUser } from './api-token.service'; // This would be ideal
    // await deleteAllApiTokensForUser(db, userId);
    const stmt = db.prepare('DELETE FROM ApiTokens WHERE UserId = ?').bind(userId);
    const apiTokenDeletionResult = await stmt.run();
    console.log(`API tokens deletion result for user ${userId}:`, apiTokenDeletionResult.success);
    if (!apiTokenDeletionResult.success) {
        // Log the error but proceed to delete the user from Auth0 if that's desired.
        // Or, decide if this is a critical failure that should stop the process.
        console.error(`Failed to delete API tokens for user ${userId}. Some tokens might remain.`);
    }
  } catch (e: any) {
    console.error(`Error deleting API tokens for user ${userId} from D1:`, e.message);
    // Decide if this is a critical failure. For now, we'll log and attempt Auth0 deletion.
  }

  // Step 2: Delete the user from Auth0 (simulated)
  // In a real application:
  // const auth0Domain = env.AUTH0_DOMAIN;
  // const mgmtToken = await getAuth0ManagementApiToken(env); // Helper to get M2M token
  // const response = await fetch(`https://${auth0Domain}/api/v2/users/${userId}`, {
  //   method: 'DELETE',
  //   headers: { 'Authorization': `Bearer ${mgmtToken}` },
  // });
  // if (!response.ok) {
  //   // If user not found in Auth0, it might have been deleted already, or never existed.
  //   // This might not be an error depending on how you want to handle it.
  //   if (response.status === 404) {
  //       console.warn(`User ${userId} not found in Auth0. Might have been already deleted.`);
  //   } else {
  //       const errorBody = await response.text();
  //       console.error(`Failed to delete user ${userId} from Auth0:`, response.status, errorBody);
  //       return false; // Or handle more gracefully
  //   }
  // }
  // console.log(`User ${userId} successfully deleted from Auth0 (simulated).`);

  // For this example, we assume the primary user deletion (Auth0) is the critical part.
  // If that "succeeds" (or is simulated to succeed), we return true.
  // Also, delete from a local 'Users' table if it exists and is used.
  try {
    const userDeleteStmt = db.prepare('DELETE FROM Users WHERE Auth0UserId = ?').bind(userId);
    const userDeleteResult = await userDeleteStmt.run();
    console.log(`Local 'Users' table deletion result for user ${userId}:`, userDeleteResult.success);
    // If the user wasn't in the local Users table, it's not necessarily an error for the overall operation.
  } catch (e: any) {
    console.error(`Error deleting user ${userId} from local 'Users' table:`, e.message);
    if (e.message?.includes('no such table')) {
        console.warn("Table 'Users' does not exist. No local user record to delete.");
    }
    // Depending on requirements, this might not make the whole operation fail.
  }


  console.log(`User account deletion process completed for userId: ${userId} (simulated for Auth0 part).`);
  return true; // Placeholder
}

// Optional: If we need to fetch user details from our local D1 mirror
// (e.g., if Auth0 is not the sole source of truth for all user-related data displayed in the app)
export async function getUserById(db: D1Database, userId: string): Promise<User | null> {
  // TODO: Determine actual database schema. This is a placeholder.
  // Assuming a 'Users' table with 'Auth0UserId' as the primary key.
  try {
    const stmt = db.prepare('SELECT Auth0UserId as id, Email, GivenName, FamilyName, Nickname, FullName as name FROM Users WHERE Auth0UserId = ?').bind(userId);
    const userRecord = await stmt.first<User>();
    return userRecord || null;
  } catch (e:any) {
    console.error('Error fetching user by ID from D1:', e.message);
    if (e.message?.includes('no such table')) {
        console.warn("Table 'Users' does not exist. Cannot fetch user.");
    }
    return null;
  }
}
