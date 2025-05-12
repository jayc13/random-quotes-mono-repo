import { type IRequest, error } from "itty-router";

export async function checkIsAdmin(ctx: ExecutionContext) {
  return ctx.props.user?.roles?.includes("Admin") ?? false;
}

export async function isAdminMiddleware(
  request: IRequest,
  env: Env,
  ctx: ExecutionContext,
) {
  // First, ensure that the user property is populated by a preceding authentication middleware
  if (!ctx.props || !ctx.props.user || !ctx.props.user.sub) {
    // This case should ideally be handled by an authentication middleware that runs before this.
    // If ctx.props.user is not set, it means authentication didn't run or failed.
    console.warn(
      "isAdminMiddleware: ctx.props.user not set. Ensure authenticationMiddleware runs first.",
    );
    return error(401, {
      success: false,
      error: "Unauthorized. User not authenticated.",
    });
  }

  const adminCheck = await checkIsAdmin(ctx);
  if (!adminCheck) {
    return error(403, {
      success: false,
      error: "Forbidden. Admin privileges required.",
    });
  }
}
