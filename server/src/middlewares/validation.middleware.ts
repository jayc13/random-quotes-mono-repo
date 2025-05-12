import { IRequest, error } from 'itty-router';
import { Env } from '@/types/env.types'; // Assuming Env type might be needed for context or future use
import { ExecutionContext } from '@cloudflare/workers-types';
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';

export const validateIdParam = (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const id = request.params?.id;
  if (!id || !/^\d+$/.test(id)) {
    return error(400, { success: false, error: "Invalid ID format" }, { headers: DEFAULT_CORS_HEADERS });
  }
  // If ID is valid, proceed to the next handler
  // itty-router automatically proceeds if no response is returned by the middleware
};
