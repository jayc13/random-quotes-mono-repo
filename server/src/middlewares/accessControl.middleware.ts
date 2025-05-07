import { validateApiToken } from "@/services/api-token.service";
import type { User } from "./authentication.middleware"; // Assuming User type might be useful or can be simplified

// Define a more specific type for Env if available, otherwise use a generic one
interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS?: string;
  // Other env variables used by your application
  [key: string]: any;
}

interface ExecutionContext {
  props: {
    user?: Partial<User>; // User context, can be Partial if API user is simpler
    accessGranted?: boolean;
    authMethod?: "origin" | "apitoken" | "jwt" | string; // To track how auth was granted
    [key: string]: any;
  };
  // waitUntil: (promise: Promise<any>) => void;
  // passThroughOnException: () => void;
  [key: string]: any; // Allow other properties
}

/**
 * Middleware for controlling access via Origin header or API Token.
 * It sets `ctx.props.accessGranted` and `ctx.props.authMethod` if access is allowed by one of its methods.
 * It does not throw errors but passes control to the next middleware.
 */
export async function accessControlMiddleware(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  next: () => Promise<Response | void>, // Assuming next is a function returning a Promise
): Promise<Response | void> {
  // Initialize accessGranted and authMethod in ctx.props if not already present
  if (ctx.props === undefined) {
    ctx.props = {};
  }
  ctx.props.accessGranted = false;
  // ctx.props.authMethod = undefined; // Clear any previous auth method

  // 1. Origin Allowlist Check
  const allowedOriginsEnv = env.ALLOWED_ORIGINS;
  if (allowedOriginsEnv) {
    const requestOrigin = request.headers.get("Origin");
    if (requestOrigin) {
      const allowedOrigins = allowedOriginsEnv
        .split(",")
        .map((origin) => origin.trim().toLowerCase());
      if (allowedOrigins.includes(requestOrigin.toLowerCase())) {
        console.log(`Access granted by Origin: ${requestOrigin}`);
        ctx.props.accessGranted = true;
        ctx.props.authMethod = "origin";
        return await next(); // Access granted, proceed to next middleware/handler
      }
      console.log(
        `Origin ${requestOrigin} not in allowed list: ${allowedOriginsEnv}.`,
      );
    } else {
      console.log("No Origin header present for Origin check.");
    }
  } else {
    console.log("ALLOWED_ORIGINS not set. Skipping Origin check.");
  }

  // 2. API Token Authentication (only if Origin check did not grant access)
  const apiToken = request.headers.get("API-Token");
  if (apiToken) {
    console.log("API-Token header found. Validating...");
    try {
      const isValidApiToken = await validateApiToken(env.DB, apiToken);
      if (isValidApiToken) {
        console.log("Access granted by API Token.");
        ctx.props.accessGranted = true;
        ctx.props.authMethod = "apitoken";
        // Set a basic user context for API token users
        ctx.props.user = {
          name: "API Token User",
          // Using 'sub' for id-like field as per User interface
          sub: "api-token-user", // Or generate a unique ID based on token if needed
          roles: ["ApiUser"],
        };
        return await next(); // Access granted, proceed
      }
      console.log("Invalid API Token.");
    } catch (error) {
      console.error("Error during API Token validation:", error);
      // Do not throw, let subsequent middleware handle final auth decision
    }
  } else {
    console.log("API-Token header not found. Skipping API Token check.");
  }

  // 3. No Access Granted by this Middleware
  // If neither Origin nor API Token granted access, proceed to the next middleware in the chain.
  // `ctx.props.accessGranted` will remain `false` (or its previous state if modified by other means).
  console.log(
    "Access not granted by accessControlMiddleware. Passing to next middleware.",
  );
  return await next();
}
