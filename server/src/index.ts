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

    // --- Authentication Middleware ---

    try {
      await authenticationMiddleware(request, env, ctx);
    } catch {
      return Response.json(
        {
          error: "Unauthorized",
          message: "Authentication failed.",
        },
        { status: 401 },
      );
    }

    // Regular authenticated user

    if (!(await isAdmin(ctx))) {
      return Response.json(
        {
          error: "Forbidden",
          message: "You do not have permission to perform this action.",
        },
        { status: 403 },
      );
    }

    // Admin authenticated user

    try {
      if (url.pathname === "/categories" && request.method === "POST") {
        try {
          const requestBody = await request.json<CategoryInput>();
          return createCategoryHandler(env.DB, requestBody);
        } catch {
          return Response.json("Invalid JSON", {
            status: 400,
            headers: DEFAULT_CORS_HEADERS,
          });
        }
      }

      if (url.pathname.startsWith("/categories/")) {
        const categoryId: number = Number.parseInt(url.pathname.split("/")[2]);
        switch (request.method) {
          case "PATCH":
          case "PUT": {
            const requestBody = await request.json<CategoryInput>();
            if (!requestBody.name) {
              return Response.json("Invalid request body", { status: 400 });
            }
            return updateCategoryHandler(env.DB, categoryId, requestBody);
          }
          case "GET":
            return getCategoryByIdHandler(env.DB, categoryId);
          case "DELETE":
            return deleteCategoryHandler(env.DB, categoryId);
        }
      }

      if (url.pathname === "/quotes") {
        switch (request.method) {
          case "GET":
            return getAllQuotesHandler(request, env.DB);
          case "POST":
            try {
              const requestBody = await request.json<QuoteInput>();
              return createQuoteHandler(env.DB, requestBody);
            } catch {
              return Response.json("Invalid JSON", {
                status: 400,
                headers: DEFAULT_CORS_HEADERS,
              });
            }
        }
      }

      if (url.pathname.startsWith("/quotes/")) {
        const quoteId: number = Number.parseInt(url.pathname.split("/")[2]);
        switch (request.method) {
          case "PATCH":
          case "PUT": {
            const requestBody = await request.json<QuoteInput>();
            return updateQuoteHandler(env.DB, quoteId, requestBody);
          }
          case "GET":
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
        const tokenId: number = Number.parseInt(tokenIdStr, 10);

        if (!Number.isNaN(tokenId) && tokenId > 0) {
          return deleteApiTokenHandler(request, env, ctx, tokenId);
        }
        // Handle invalid or missing token ID in URL
        return Response.json(
          {
            error: "Bad Request",
            message: "Invalid or missing Token ID in URL path.",
          },
          {
            status: 400,
            headers: DEFAULT_CORS_HEADERS,
          },
        );
      }

      // --- End API Token Routes ---
    } catch (error) {
      console.error("Error handling request:", error);
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
