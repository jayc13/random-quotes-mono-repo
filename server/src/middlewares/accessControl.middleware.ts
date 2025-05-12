import { validateApiToken } from "@/services/api-token.service";
import { error } from "itty-router";

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
  ctx.props.originAllowed = true;

  const allowedOrigins = env.ALLOWED_ORIGINS?.split(",").map((o: string) =>
    o.trim().toLowerCase(),
  );
  const requestOrigin = request.headers.get("Origin");

  if (allowedOrigins && requestOrigin) {
    const lowerRequestOrigin = requestOrigin.toLowerCase();
    ctx.props.originAllowed = allowedOrigins.some((pattern) => {
      // Exact match
      if (pattern === lowerRequestOrigin) return true;

      // Wildcard match (*.example.com)
      if (
        pattern.startsWith("*") &&
        lowerRequestOrigin.endsWith(pattern.slice(1))
      ) {
        return true;
      }

      // Full wildcard
      return pattern === "*";
    });
  }

  const apiTokenHeaders = request.headers.get("api-token");
  const apiTokenQuery = new URL(request.url).searchParams.get("api-token");

  const apiToken = apiTokenHeaders || apiTokenQuery;

  if (!apiToken) {
    return return401();
  }

  try {
    const isValid = await validateApiToken(apiToken, env.DB);
    if (!isValid) {
      return return401();
    }
  } catch {
    return return401();
  }
  ctx.props.accessGranted = true;
  ctx.props.authMethod = "apitoken";
  ctx.props.user = {
    name: "API Token User",
    sub: "api-token-user",
    roles: ["ApiUser"],
  };
}

function return401() {
  return error(401, {
    success: false,
    error: "Unauthorized. User not authenticated.",
  });
}
