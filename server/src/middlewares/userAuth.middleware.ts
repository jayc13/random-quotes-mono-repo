import { type IRequest, error } from "itty-router";

export const requireUserAuthMiddleware = (
  request: IRequest,
  env: Env,
  ctx: ExecutionContext,
) => {
  if (!ctx.props?.user?.sub) {
    return error(401, {
      success: false,
      error: "Unauthorized. User authentication required.",
    });
  }
};
