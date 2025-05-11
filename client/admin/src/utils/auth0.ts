import type { GetTokenSilentlyOptions } from "@auth0/auth0-spa-js";

export interface Auth0ManagementApiOptions {
  getAccessTokenSilently: (
    options?: GetTokenSilentlyOptions,
  ) => Promise<string>;
  auth0Domain: string;
  userId: string;
}

const fetchWithAuth = async (
  url: string,
  method: string,
  token: string,
  body?: object,
) => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `Request failed: ${response.status}`);
  }

  return response.status === 204 ? undefined : await response.json();
};

export const updateUserName = async (
  options: Auth0ManagementApiOptions,
  newName: string,
) => {
  const token = await options.getAccessTokenSilently({
    authorizationParams: {
      audience: `https://${options.auth0Domain}/api/v2/`,
      scope: "update:current_user_metadata",
    },
  });

  const payload = {
    name: newName,
    nickname: newName,
    user_metadata: { name: newName },
  };

  return fetchWithAuth(
    `https://${options.auth0Domain}/api/v2/users/${options.userId}`,
    "PATCH",
    token,
    payload,
  );
};

export const changeUserPassword = async (
  options: Auth0ManagementApiOptions,
) => {
  const token = await options.getAccessTokenSilently({
    authorizationParams: {
      audience: `https://${options.auth0Domain}/api/v2/`,
      scope: "create:user_tickets",
    },
  });

  const payload = {
    user_id: options.userId,
    result_url: window.location.origin,
    ttl_sec: 0,
  };

  return fetchWithAuth(
    `https://${options.auth0Domain}/api/v2/tickets/password-change`,
    "POST",
    token,
    payload,
  );
};

export const deleteUserAccount = async (options: Auth0ManagementApiOptions) => {
  const token = await options.getAccessTokenSilently({
    authorizationParams: {
      audience: `https://${options.auth0Domain}/api/v2/`,
      scope: "delete:current_user",
    },
  });

  return fetchWithAuth(
    `https://${options.auth0Domain}/api/v2/users/${options.userId}`,
    "DELETE",
    token,
  );
};
