import type { UpdateUserNameInput } from "@/types/user.types";

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

// Interface for the options parameter in updateUserName function
export interface UserServiceOptions {
  env: Env;
  auth0Token: string;
}

export async function updateUserName(
  userId: string,
  data: UpdateUserNameInput,
  options: UserServiceOptions,
): Promise<boolean> {
  const { env } = options;
  if (!userId || !data) {
    return false;
  }
  const auth0Domain = env.AUTH0_DOMAIN;

  const auth0Token: string = await getAuth0ManagementToken(env);
  try {
    const response = await fetch(
      `https://${auth0Domain}/api/v2/users/${userId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${auth0Token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: data.name,
          name: data.name,
        }),
      },
    );
    return response.ok;
  } catch {
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
    console.error("sendForgotPasswordEmail: No email provided.");
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
  userId: string,
  env: Env,
): Promise<boolean> {
  const db = env.DB as D1Database; // Assuming DB is a D1Database instance

  if (!userId) {
    console.error("deleteUserAccount: No userId provided.");
    return false;
  }

  console.log(`Attempting to delete user account: ${userId}`);

  // Step 1: Delete API tokens associated with the user (local D1 operation)
  try {
    const stmt = db
      .prepare("DELETE FROM ApiTokens WHERE UserId = ?")
      .bind(userId);
    await stmt.run();
  } catch {
    console.error(`Error deleting API tokens for user ${userId}`);
  }

  // Step 2: Delete the user from Auth0 (simulated)
  const auth0Domain = env.AUTH0_DOMAIN;
  const auth0Token: string = await getAuth0ManagementToken(env);
  await fetch(`https://${auth0Domain}/api/v2/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${auth0Token}` },
  });

  console.log(`User account deletion process completed for userId: ${userId}`);
  return true;
}

async function getAuth0ManagementToken(env: Env): Promise<string> {
  try {
    const response = await fetch(`https://${env.AUTH0_DOMAIN}/oauth/token`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: env.AUTH0_CLIENT_ID,
        client_secret: env.AUTH0_CLIENT_SECRET,
        audience: `https://${env.AUTH0_DOMAIN}/api/v2/`,
      }),
    });

    const data: {
      access_token: string;
      token_type: string;
      expires_in: number;
      scope: string;
    } = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting management token:", error);
    throw error;
  }
}
