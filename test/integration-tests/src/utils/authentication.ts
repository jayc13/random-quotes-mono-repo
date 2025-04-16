export type USER_TYPE = 'ADMIN' | 'REGULAR';

const CREDENTIALS = {
  ADMIN: {
    username: process.env.ADMIN_USER_EMAIL || 'admin',
    password: process.env.ADMIN_USER_PASSWORD || 'admin',
  },
  REGULAR: {
    username: process.env.REGULAR_USER_EMAIL || 'user',
    password: process.env.REGULAR_USER_PASSWORD || 'user',
  },
}

export const getUserAuthToken = async (userType: USER_TYPE): Promise<string> => {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Accept": "application/json",
  });

  const authDomain = process.env.AUTH0_DOMAIN || 'auth0.com/oauth/token';

  const {username, password} = CREDENTIALS[userType];

  const requestOptions = {
    method: "POST",
    headers,
    body: JSON.stringify({
      grant_type: "password",
      username,
      password,
      audience: `https://${authDomain}/api/v2/`,
      scope: "openid profile email",
      client_id: process.env.AUTH0_CLIENT_ID || "",
      client_secret: process.env.AUTH0_CLIENT_SECRET || "",
    }),
  };

  const response = await fetch(`https://${authDomain}/oauth/token`, requestOptions);

  if (!response.ok) {
    throw new Error(`Error fetching auth token: ${response.statusText}`);
  }

  const data = await response.json();

  return `Bearer ${data.id_token}`;
}