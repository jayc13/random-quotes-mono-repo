import {
  createApiTokenHandler,
  deleteApiTokenHandler,
  getUserApiTokensHandler,
} from "@/controllers/api-token.controller";
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getAllCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
} from "@/controllers/category.controller";
import { getRandomQuoteSvgHandler } from "@/controllers/quote-svg.controller";
import {
  createQuoteHandler,
  deleteQuoteHandler,
  getAllQuotesHandler,
  getQuoteByIdHandler,
  getQuoteOfTheDayHandler,
  getRandomQuoteHandler,
  updateQuoteHandler,
} from "@/controllers/quote.controller";
import { accessControlMiddleware } from "@/middlewares/accessControl.middleware";
import {
  authenticationMiddleware,
  isAdmin,
} from "@/middlewares/authentication.middleware";
import type { CategoryInput } from "@/types/category.types";
import type { QuoteInput } from "@/types/quote.types";
import { DEFAULT_CORS_HEADERS } from "@/utils/constants";

export interface Env {
  DB: D1Database;
  QUOTES_KV: KVNamespace;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
}

const validateId = (id: string): boolean => !/^\d+$/.test(id);

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response("OK", {
        headers: DEFAULT_CORS_HEADERS,
      });
    }

    // --- Public Routes (No Authentication Required) ---
    if (url.pathname === "/random" && request.method === "GET") {
      return getRandomQuoteHandler(request, env);
    }

    if (url.pathname === "/categories" && request.method === "GET") {
      return getAllCategoriesHandler(env.DB);
    }

    // New route for random SVG generation
    if (url.pathname === "/random.svg" && request.method === "GET") {
      return getRandomQuoteSvgHandler(request, env.DB);
    }

    if (url.pathname === "/qotd" && request.method === "GET") {
      return getQuoteOfTheDayHandler(request, env);
    }

    // --- Authentication & Authorization for non-public routes ---

    // 1. Apply Access Control Middleware (Origin, API Token)
    // This middleware will set ctx.props.accessGranted and ctx.props.authMethod if successful.
    // It calls next() regardless, so subsequent checks are needed.
    // For this worker structure, the next function is a placeholder.
    await accessControlMiddleware(request, env, ctx, async () => {});

    // 2. Apply JWT Authentication if Access Control did not grant access
    if (!ctx.props.accessGranted) {
      try {
        await authenticationMiddleware(request, env, ctx);
      } catch (e: any) {
        // If JWT authentication fails, and no other access was granted.
        return Response.json(
          {
            error: "Unauthorized",
            message: e.message || "Authentication required.",
          },
          { status: 401, headers: DEFAULT_CORS_HEADERS },
        );
      }
    }
    // At this point, if a request is to proceed to an authenticated route,
    // either ctx.props.accessGranted is true (by origin/API token)
    // or ctx.props.user is populated by JWT's authenticationMiddleware.
    // If neither, the catch above (for JWT) or the lack of ctx.props.user for admin routes
    // will prevent access.

    // --- Routes Requiring Authentication + Admin Role ---
    // The isAdmin check below will use ctx.props.user, which could be from JWT
    // or from API token (if accessControlMiddleware set it).
    // If access was granted by origin, ctx.props.user might be undefined or minimal.
    // The isAdmin check (ctx.props.user?.roles?.includes("Admin")) handles this.

    // Apply Admin Check globally for remaining routes
    if (!(await isAdmin(ctx))) {
      return Response.json(
        { error: "Forbidden", message: "Admin privileges required." },
        { status: 403, headers: DEFAULT_CORS_HEADERS },
      );
    }

    // --- Admin-Only Routes ---
    try {
      // POST /categories
      if (url.pathname === "/categories" && request.method === "POST") {
        const requestBody = await request.json<CategoryInput>();
        return createCategoryHandler(env.DB, requestBody);
      }

      // /categories/:id (PUT, DELETE, GET - GET needs admin here?)
      // Note: The original code had GET /categories/:id here, implying it needed admin.
      // Keeping it here for now, but it might be better public or just authenticated.
      if (url.pathname.startsWith("/categories/")) {
        const categoryIdStr = url.pathname.split("/")[2];
        if (validateId(categoryIdStr)) {
          return Response.json(
            { error: "Invalid ID format" },
            { status: 400, headers: DEFAULT_CORS_HEADERS },
          );
        }
        const categoryId = Number.parseInt(categoryIdStr, 10);

        switch (request.method) {
          case "PATCH": // Assuming PATCH is like PUT
          case "PUT": {
            const requestBody = await request.json<CategoryInput>();
            return updateCategoryHandler(env.DB, categoryId, requestBody);
          }
          case "GET": // Requires admin in this block
            return getCategoryByIdHandler(env.DB, categoryId);
          case "DELETE":
            return deleteCategoryHandler(env.DB, categoryId);
        }
      }

      // GET /quotes
      if (url.pathname === "/quotes" && request.method === "GET") {
        // This route is now covered by the global admin check.
        // authenticationMiddleware (JWT) would have run if !ctx.props.accessGranted.
        // The isAdmin check is global for this section.
        return getAllQuotesHandler(request, env.DB);
      }

      // POST /quotes
      if (url.pathname === "/quotes" && request.method === "POST") {
        const requestBody = await request.json<QuoteInput>();
        return createQuoteHandler(env.DB, requestBody);
      }

      // /quotes/:id (PUT, DELETE, GET - GET needs admin here?)
      // Note: The original code had GET /quotes/:id here. Keeping it admin-only.
      if (url.pathname.startsWith("/quotes/")) {
        const quoteIdStr = url.pathname.split("/")[2];
        if (validateId(quoteIdStr)) {
          return Response.json(
            { error: "Invalid ID format" },
            { status: 400, headers: DEFAULT_CORS_HEADERS },
          );
        }
        const quoteId = Number.parseInt(quoteIdStr, 10);

        switch (request.method) {
          case "PATCH": // Assuming PATCH is like PUT
          case "PUT": {
            const requestBody = await request.json<QuoteInput>();
            return updateQuoteHandler(env.DB, quoteId, requestBody);
          }
          case "GET": // Requires admin in this block
            return getQuoteByIdHandler(env.DB, quoteId);
          case "DELETE":
            return deleteQuoteHandler(env.DB, quoteId);
        }
      }

      // --- API Token Routes (Admin Only) ---

      // GET /api-tokens - List user's tokens
      if (url.pathname === "/api-tokens" && request.method === "GET") {
        // Assuming only admins manage tokens for now, reuse isAdmin check
        // If regular users need to manage their own, adjust middleware/checks
        return getUserApiTokensHandler(request, env, ctx);
      }

      // POST /api-tokens - Create a new token
      if (url.pathname === "/api-tokens" && request.method === "POST") {
        try {
          // Assuming request body parsing is needed, similar to categories/quotes
          return createApiTokenHandler(request, env, ctx);
        } catch (e) {
          // Basic error handling for invalid JSON
          const message = e instanceof Error ? e.message : "Invalid JSON";
          return Response.json(
            { error: "Bad Request", message },
            {
              status: 400,
              headers: DEFAULT_CORS_HEADERS,
            },
          );
        }
      }

      // DELETE /api-tokens/:tokenId - Delete a specific token
      if (
        url.pathname.startsWith("/api-tokens/") &&
        request.method === "DELETE"
      ) {
        const pathSegments = url.pathname.split("/");
        const tokenIdStr = pathSegments[pathSegments.length - 1]; // Get the last segment
        if (validateId(tokenIdStr)) {
          return Response.json(
            { error: "Invalid ID format" },
            { status: 400, headers: DEFAULT_CORS_HEADERS },
          );
        }
        const tokenId: number = Number.parseInt(tokenIdStr, 10);

        return deleteApiTokenHandler(request, env, ctx, tokenId);
      }

      // --- End API Token Routes ---
    } catch (error) {
      console.error("Error handling admin request:", error);
      return Response.json(
        {
          error: "Internal Server Error",
          message:
            "An unexpected error occurred while processing your request.",
        },
        {
          status: 500,
          headers: DEFAULT_CORS_HEADERS,
        },
      );
    }

    return Response.json(
      {
        error: "Not Found",
        message: "The requested resource was not found.",
      },
      { status: 404 },
    );
  },
} satisfies ExportedHandler<Env>;
