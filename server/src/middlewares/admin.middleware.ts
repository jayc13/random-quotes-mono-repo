import { IRequest, error } from 'itty-router';
import { isAdmin as checkIsAdmin } from './authentication.middleware'; // Assuming isAdmin is exported here
import { Env } from '@/types/env.types'; // Assuming Env type is needed for context or future use
import { ExecutionContext } from '@cloudflare/workers-types';
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';

export async function isAdminMiddleware(request: IRequest, env: Env, ctx: ExecutionContext) {
  // First, ensure that the user property is populated by a preceding authentication middleware
  if (!ctx.props || !ctx.props.user || !ctx.props.user.sub) {
    // This case should ideally be handled by an authentication middleware that runs before this.
    // If ctx.props.user is not set, it means authentication didn't run or failed.
    console.warn('isAdminMiddleware: ctx.props.user not set. Ensure authenticationMiddleware runs first.');
    return error(401, { success: false, error: 'Unauthorized. User not authenticated.' }, { headers: DEFAULT_CORS_HEADERS });
  }

  const adminCheck = await checkIsAdmin(ctx);
  if (!adminCheck) {
    return error(403, { success: false, error: 'Forbidden. Admin privileges required.' }, { headers: DEFAULT_CORS_HEADERS });
  }
  
  // If admin, proceed to the next handler
  // itty-router automatically proceeds if no response is returned by the middleware
}
