import { validateApiToken } from "@/services/api-token.service";

/**
 * Middleware for controlling access via Origin header or API Token.
 * It sets `ctx.props.accessGranted` and `ctx.props.authMethod` if access is allowed by one of its methods.
 * It does not throw errors but passes control to the next middleware.
 */
export async function accessControlMiddleware(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
) {
  if (!ctx.props) ctx.props = {};
  ctx.props.accessGranted = false;

  const allowedOrigins = env.ALLOWED_ORIGINS?.split(",").map((o: string) =>
    o.trim().toLowerCase(),
  );
  const requestOrigin = request.headers.get("Origin");

  if (
    allowedOrigins &&
    requestOrigin &&
    allowedOrigins.includes(requestOrigin.toLowerCase())
  ) {
    console.log(`Access granted by Origin: ${requestOrigin}`);
    ctx.props.accessGranted = true;
    ctx.props.authMethod = "origin";
    return;
  }

  const apiToken = request.headers.get("api-token");

  if (!apiToken) {
    throw new Error("No API-Token provided.");
  }

  const isValid = await validateApiToken(apiToken, env.DB);
  if (!isValid) {
    throw new Error("Invalid API Token.");
  }
  console.log("Access granted by API Token.");
  ctx.props.accessGranted = true;
  ctx.props.authMethod = "apitoken";
  ctx.props.user = {
    name: "API Token User",
    sub: "api-token-user",
    roles: ["ApiUser"],
  };
}
