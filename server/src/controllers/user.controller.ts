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

// Define the expected structure for name parts in the request body
interface NamePartsRequestBody {
  given_name?: string;
  family_name?: string;
  nickname?: string;
  name?: string;
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
    // TODO: Implement the actual user name update logic
    return json({
      success: true,
      message: "User name updated successfully.",
      data: {
        message: "TODO: Implement the actual user name update logic",
      },
      // data: updatedUser,
    });
  } catch {
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
    // TODO: Implement the actual logic to send a password reset email
    // Return a generic success message to prevent user enumeration
    return json({
      success: true,
      message: `If an account exists for ${userEmail}, a password reset email has been sent.`,
      details: {
        message:
          "TODO: Implement the actual logic to send a password reset email",
      },
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
): Promise<Response> {
  const userId = request.props?.user?.sub;

  if (!userId) {
    return error(401, {
      success: false,
      error: "Unauthorized. User ID not found.",
    });
  }

  try {
    // TODO: Implement the actual logic to delete the user account
    // Typically, a DELETE operation that is successful returns a 204 No Content,
    // or a 200/202 if the deletion is asynchronous or needs further confirmation.
    // For simplicity and to provide some feedback, a 200 with a message is used here.
    // Consider 204 No Content if no body is preferred: return new Response(null, { status: 204 });
    return json({
      success: true,
      message: `User account ${userId} has been successfully scheduled for deletion.`,
      details: {
        message: "TODO: Implement the actual logic to delete user account",
      },
    });
  } catch {
    console.error(`Error in deleteUserAccountHandler for user ${userId}`);
    return error(500, {
      success: false,
      error: "An unexpected error occurred while deleting user account.",
    });
  }
}
