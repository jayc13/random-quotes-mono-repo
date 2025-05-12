import { IRequest, error } from 'itty-router';
import { Env } from '@/types/env.types'; // Assuming Env type might be needed for context or future use
import { ExecutionContext } from '@cloudflare/workers-types';
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';

export const requireUserAuthMiddleware = (request: IRequest, env: Env, ctx: ExecutionContext) => {
  if (!ctx.props?.user?.sub) {
    return error(401, { success: false, error: "Unauthorized. User authentication required." }, { headers: DEFAULT_CORS_HEADERS });
  }
  // If user is authenticated, proceed to the next handler
  // itty-router automatically proceeds if no response is returned by the middleware
};
