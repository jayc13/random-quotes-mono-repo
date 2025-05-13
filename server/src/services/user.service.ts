import type { UpdateUserNameInput } from "@/types/user.types";

export interface UserServiceOptions {
  env: Env;
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
  } catch (error) {
    console.error("Error updating user name:", error);
    return false;
  }
}

export async function sendForgotPasswordEmail(
  env: Env,
  userEmail: string,
): Promise<boolean> {
  if (!userEmail) {
    return false;
  }

  const auth0Domain = env.AUTH0_DOMAIN;
  const response = await fetch(
    `https://${auth0Domain}/dbconnections/change_password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: env.AUTH0_CLIENT_ID,
        email: userEmail,
        connection: "Username-Password-Authentication",
      }),
    },
  );

  return response.ok;
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
        client_id: env.AUTH0_MGMT_CLIENT_ID,
        client_secret: env.AUTH0_MGMT_CLIENT_SECRET,
        audience: `https://${env.AUTH0_DOMAIN}/api/v2/`,
      }),
    });

    const data: {
      access_token: string;
      token_type: string;
      expires_in: number;
    } = await response.json();

    return data.access_token;
  } catch (error) {
    console.error("Error getting management token:", error);
    throw error;
  }
}
