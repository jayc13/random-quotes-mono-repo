import * as userService from "@/services/user.service";
import type { UpdateUserNameInput } from "@/types/user.types";
import { type IRequest, error, json } from "itty-router";

// Define a type for the expected request properties after authentication middleware
interface AuthenticatedRequest extends IRequest {
  props?: {
    user?: {
      sub?: string; // User ID from JWT 'sub' claim
      email?: string; // User email from JWT custom claim or Auth0 profile
    };
    accessGranted?: boolean; // Flag from access control middleware
  };
}

export async function updateUserNameHandler(
  request: AuthenticatedRequest,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const userId = ctx.props.user.sub;

  if (!userId) {
    // This should ideally be caught by authenticationMiddleware, but as a safeguard:
    return error(401, {
      success: false,
      error: "Unauthorized. User ID not found.",
    });
  }

  const updateUserNameInput: UpdateUserNameInput = await request.json();

  const success = await userService.updateUserName(
    userId,
    updateUserNameInput,
    {
      env,
      auth0Token: request.headers.get("authorization")?.split("Bearer ")?.[1],
    },
  );
  if (success) {
    return json({
      success: true,
      message: "User name updated successfully.",
    });
  }
  return error(404, {
    success: false,
    error: "User not found or update failed.",
  });
}

export async function sendForgotPasswordEmailHandler(
  request: AuthenticatedRequest,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const userEmail = request.props?.user?.email;
  const userId = request.props?.user?.sub; // For logging or if needed by service in future

  if (!userId) {
    // This should ideally be caught by authenticationMiddleware if sub is always expected
    return error(401, {
      success: false,
      error: "Unauthorized. User identifier not found.",
    });
  }

  if (!userEmail) {
    // If email is not present in the token (e.g. not configured in custom claims or scope)
    console.error(
      `User ${userId} attempted password reset, but email was not found in token props.`,
    );
    return error(400, {
      success: false,
      error: "User email not found in token. Cannot initiate password reset.",
    });
  }

  try {
    // The service function currently simulates this and returns true.
    // It expects db and userEmail.
    const success = await userService.sendForgotPasswordEmail(
      env.DB,
      userEmail,
    );
    if (success) {
      return json({
        success: true,
        message: `If an account exists for ${userEmail}, a password reset email has been sent.`,
      });
    }
    return error(500, {
      success: false,
      error: "An unexpected error occurred while initiating password reset.",
    });
  } catch {
    return error(500, {
      success: false,
      error: "An unexpected error occurred while initiating password reset.",
    });
  }
}

export async function deleteUserAccountHandler(
  request: AuthenticatedRequest,
  env: Env,
  ctx: ExecutionContext,
) {
  const userId = ctx.props.user.sub;

  if (!userId) {
    return error(401, {
      success: false,
      error: "Unauthorized. User ID not found.",
    });
  }

  const success = await userService.deleteUserAccount(userId, env);
  if (success) {
    return json({
      success: true,
      message: `User account ${userId} and associated API tokens have been successfully processed for deletion.`,
    });
  }
  return error(404, {
    success: false,
    error: "User account deletion failed or user not found.",
  });
}
