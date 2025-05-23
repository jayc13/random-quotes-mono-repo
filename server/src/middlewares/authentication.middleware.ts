import { parseJwt } from "@cfworker/jwt";
import { error } from "itty-router";

export interface User {
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
  iss: string;
  aud: string;
  sub: string;
  iat: number;
  exp: number;
  sid: string;
  nonce: string;
  roles: string[];
}

export async function authenticationMiddleware(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
) {
  const token = request.headers.get("authorization")?.split("Bearer ")?.[1];

  if (!token) {
    return;
  }

  const result = await parseJwt({
    jwt: token,
    issuer: `https://${env.AUTH0_DOMAIN}/`,
    audience: env.AUTH0_CLIENT_ID,
  });

  if (!result || !result.valid) {
    return return401();
  }

  let roles: string[] = [];
  if ("random_quotes/roles" in result.payload) {
    roles = result.payload["random_quotes/roles"] as string[];
    result.payload["random_quotes/roles"] = undefined;
  }
  ctx.props.accessGranted = true;
  ctx.props.user = {
    ...result.payload,
    roles,
  };
}

function return401() {
  return error(401, {
    success: false,
    error: "Unauthorized. User not authenticated.",
  });
}
