import { type IRequest, error, json } from "itty-router";
import * as userService from "../services/user.service";
import type { NamePartsRequestBody } from "../services/user.service";

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
  // Extract userId from request.props.user.sub (set by authenticationMiddleware)
  const userId = request.props?.user?.sub;

  if (!userId) {
    // This should ideally be caught by authenticationMiddleware, but as a safeguard:
    return error(401, {
      success: false,
      error: "Unauthorized. User ID not found.",
    });
  }

  let nameParts: NamePartsRequestBody;
  try {
    nameParts = await request.json();
    if (!nameParts || typeof nameParts !== "object") {
      throw new Error("Invalid request body");
    }
  } catch {
    return error(400, {
      success: false,
      error: "Invalid request body",
    });
  }

  // Validate that at least one name part is present and all provided parts are strings
  const validNameParts = Object.entries(nameParts).filter(
    ([key, value]) =>
      ["given_name", "family_name", "nickname", "name"].includes(key) &&
      typeof value === "string" &&
      value.trim() !== "",
  );

  if (validNameParts.length === 0) {
    return error(400, {
      success: false,
      error:
        "Invalid request body. At least one valid name part (given_name, family_name, nickname, name) must be provided as a non-empty string.",
    });
  }

  const validatedNameParts: NamePartsRequestBody =
    Object.fromEntries(validNameParts);

  try {
    const success = await userService.updateUserName(env.DB, userId, validatedNameParts);
    if (success) {
      // Optionally, you could fetch the updated user record here if needed
      // const updatedUser = await userService.getUserById(env.DB, userId);
      return json({
        success: true,
        message: "User name updated successfully.",
        // data: updatedUser // if you fetch and return the user details
      });
    } else {
      // This could be due to user not found, or DB error handled in the service
      return error(404, {
        success: false,
        error: "User not found or update failed."
      });
    }
  } catch (e: any) {
    console.error(`Error in updateUserNameHandler for user ${userId}:`, e.message);
    return error(500, {
      success: false,
      error: "An unexpected error occurred while updating user name.",
    });
  }
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
    const success = await userService.sendForgotPasswordEmail(env.DB, userEmail);
    if (success) {
      return json({
        success: true,
        message: `If an account exists for ${userEmail}, a password reset email has been sent.`,
      });
    } else {
      // This path might not be hit if the service always returns true or throws.
      return error(500, {
        success: false,
        error: "Failed to initiate password reset process.",
      });
    }
  } catch (e: any) {
    console.error(`Error in sendForgotPasswordEmailHandler for user ${userEmail} (ID: ${userId}):`, e.message);
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
): Promise<Response> {
  const userId = request.props?.user?.sub;

  if (!userId) {
    return error(401, {
      success: false,
      error: "Unauthorized. User ID not found.",
    });
  }

  try {
    // The service function attempts to delete API tokens and then simulates Auth0 deletion.
    // It expects db and userId.
    const success = await userService.deleteUserAccount(env.DB, userId);
    if (success) {
      return json({
        success: true,
        message: `User account ${userId} and associated API tokens have been successfully processed for deletion.`,
      });
      // Consider returning 204 No Content if no body is preferred for DELETE operations.
      // return new Response(null, { status: 204 });
    } else {
      // This could mean the user wasn't found in Auth0 (simulated) or token deletion failed.
      return error(404, { // Or 500 depending on the failure reason
        success: false,
        error: "User account deletion failed or user not found."
      });
    }
  } catch (e: any) {
    console.error(`Error in deleteUserAccountHandler for user ${userId}:`, e.message);
    return error(500, {
      success: false,
      error: "An unexpected error occurred while deleting user account.",
    });
  }
}
