import type { Env } from "@/types/env.types"; // Assuming Env type might be needed for context or future use
import { DEFAULT_CORS_HEADERS } from "@/utils/constants";
import type { ExecutionContext } from "@cloudflare/workers-types";
import { type IRequest, error } from "itty-router";

export const requireUserAuthMiddleware = (
  request: IRequest,
  env: Env,
  ctx: ExecutionContext,
) => {
  if (!ctx.props?.user?.sub) {
    return error(
      401,
      { success: false, error: "Unauthorized. User authentication required." },
      { headers: DEFAULT_CORS_HEADERS },
    );
  }
  // If user is authenticated, proceed to the next handler
  // itty-router automatically proceeds if no response is returned by the middleware
};
