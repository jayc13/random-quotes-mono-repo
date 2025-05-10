export interface Auth0ManagementApiOptions {
  getAccessTokenSilently: (options?: any) => Promise<string>;
  auth0Domain: string;
  userId: string;
}

export const updateUserName = async (
  options: Auth0ManagementApiOptions,
  newName: string,
) => {
  const { getAccessTokenSilently, auth0Domain, userId } = options;

  try {
    const token = await getAccessTokenSilently({
      audience: `https://${auth0Domain}/api/v2/`,
      scope: "update:current_user_metadata", // This scope might need to be "update:users" for name/nickname
    });

    // It's often better to update root attributes if possible,
    // but this depends on Auth0 setup and permissions.
    // If 'name' and 'nickname' are standard attributes you can update,
    // and 'user_metadata.name' is for custom use.
    const payload = {
      name: newName,
      nickname: newName,
      user_metadata: {
        name: newName, // Keep this in sync if you use it elsewhere
      },
    };

    const response = await fetch(
      `https://${auth0Domain}/api/v2/users/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        errorData.message || `Failed to update user name: ${response.status}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating user name:", error);
    throw error;
  }
};

export const changeUserPassword = async (
  options: Auth0ManagementApiOptions,
  // email: string, // email is not directly used if userId is available
) => {
  const { getAccessTokenSilently, auth0Domain, userId } = options;

  try {
    const token = await getAccessTokenSilently({
      audience: `https://${auth0Domain}/api/v2/`,
      scope: "create:user_tickets",
    });

    const payload = {
      user_id: userId,
      result_url: window.location.origin, // Where to redirect after password change
      ttl_sec: 0, // Time-to-live for the ticket, 0 means default
      // mark_email_as_verified: false, // Optional: whether the ticket also verifies the email
      // includeEmailInRedirect: false, // Optional: whether to include email in the redirect URL
    };

    const response = await fetch(
      `https://${auth0Domain}/api/v2/tickets/password-change`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        errorData.message ||
          `Failed to create password change ticket: ${response.status}`,
      );
    }
    return await response.json(); // This usually contains a ticket URL
  } catch (error) {
    console.error("Error creating password change ticket:", error);
    throw error;
  }
};

export const deleteUserAccount = async (options: Auth0ManagementApiOptions) => {
  const { getAccessTokenSilently, auth0Domain, userId } = options;

  try {
    const token = await getAccessTokenSilently({
      audience: `https://${auth0Domain}/api/v2/`,
      scope: "delete:current_user", // This scope might need to be "delete:users"
    });

    const response = await fetch(
      `https://${auth0Domain}/api/v2/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      // For DELETE, Auth0 might return error details in JSON format
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        errorData.message ||
          `Failed to delete user account: ${response.status}`,
      );
    }

    // For DELETE, a 204 No Content is a success and there's no body to parse.
    // Other 2xx statuses might return data, though typically not for a simple delete.
    if (response.status === 204) {
      return; // Or return a specific success indicator if needed
    }
    return await response.json(); // If there could be a body on other 2xx success
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};
