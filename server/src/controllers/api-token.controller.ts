import type { User } from "@/middlewares/authentication.middleware"; // Assuming User type is exported
import {
  deleteApiToken,
  generateApiToken,
  getUserApiTokens,
} from "@/services/api-token.service";
import type { ApiTokenInput } from "@/types/api-token.types";

// Helper function to get user ID from context
function getUserIdFromContext(ctx: ExecutionContext): string | null {
  // Adjust based on where the user info is stored by the middleware
  const user = ctx.props?.user as User | undefined;
  return user?.sub ?? null; // Assuming 'sub' is the user ID field
}

/**
 * Handles POST requests to create a new API token.
 */
export const createApiTokenHandler = async (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
) => {
  const userId = getUserIdFromContext(ctx);
  if (!userId) {
    return Response.json(
      { error: "Unauthorized", message: "User ID not found in context." },
      { status: 401 },
    );
  }

  let input: ApiTokenInput;
  try {
    input = await request.json<ApiTokenInput>();
    if (
      !input ||
      !input.name ||
      typeof input.name !== "string" ||
      input.name.trim() === ""
    ) {
      throw new Error(
        "Invalid input: Token name is required and must be a non-empty string.",
      );
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON body.";
    return Response.json({ error: "Bad Request", message }, { status: 400 });
  }

  try {
    // generateApiToken returns the token including the plain text version
    const newApiToken = await generateApiToken(env.DB, userId, input);

    // Return the newly created token details (including the plain text token)
    return Response.json(newApiToken, {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating API token:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create API token.";
    return Response.json(
      { error: "Internal Server Error", message },
      { status: 500 },
    );
  }
};

/**
 * Handles GET requests to retrieve all API tokens for the authenticated user.
 */
export const getUserApiTokensHandler = async (
  request: Request, // Keep request param for consistency, even if unused
  env: Env,
  ctx: ExecutionContext,
) => {
  const userId = getUserIdFromContext(ctx);
  if (!userId) {
    return Response.json(
      { error: "Unauthorized", message: "User ID not found in context." },
      { status: 401 },
    );
  }

  try {
    const tokens = await getUserApiTokens(env.DB, userId);
    // Return only the safe-to-display info (id, name, createdAt)
    return Response.json(tokens, {
      headers: {
        // Optional: Add Content-Range headers if using with react-admin or similar
        "Content-Range": `apitokens 0-${tokens.length}/${tokens.length}`,
        "X-Total-Count": `${tokens.length}`,
      },
    });
  } catch (error) {
    console.error("Error fetching API tokens:", error);
    return Response.json(
      {
        error: "Internal Server Error",
        message: "Failed to retrieve API tokens.",
      },
      { status: 500 },
    );
  }
};

/**
 * Handles DELETE requests to remove an API token by its ID.
 */
export const deleteApiTokenHandler = async (
  request: Request, // Keep request param
  env: Env,
  ctx: ExecutionContext,
  tokenId: number, // Assume tokenId is extracted from the URL path by the router
) => {
  const userId = getUserIdFromContext(ctx);
  if (!userId) {
    return Response.json(
      { error: "Unauthorized", message: "User ID not found in context." },
      { status: 401 },
    );
  }

  if (Number.isNaN(tokenId) || tokenId <= 0) {
    return Response.json(
      { error: "Bad Request", message: "Invalid Token ID provided." },
      { status: 400 },
    );
  }

  try {
    const deleted = await deleteApiToken(env.DB, userId, tokenId);

    if (!deleted) {
      // Token not found or user doesn't have permission
      return Response.json(
        {
          error: "Not Found",
          message:
            "API Token not found or you do not have permission to delete it.",
        },
        { status: 404 },
      );
    }

    // Successfully deleted
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error(`Error deleting API token ID ${tokenId}:`, error);
    return Response.json(
      {
        error: "Internal Server Error",
        message: "Failed to delete API token.",
      },
      { status: 500 },
    );
  }
};
