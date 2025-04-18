import {
  createCategoryHandler,
  deleteCategoryHandler,
  getAllCategoriesHandler,
  getCategoryByIdHandler,
  updateCategoryHandler,
} from "./controller/category.controller";
import {
  createQuoteHandler,
  deleteQuoteHandler,
  getAllQuotesHandler,
  getQuoteByIdHandler,
  updateQuoteHandler,
} from "./controller/quote.controller";
import {
  authenticationMiddleware,
  isAdmin,
} from "./middleware/authentication.middleware";
import type { CategoryInput } from "./services/category.service";
import type { QuoteInput } from "./services/quote.service";

export interface Env {
  DB: D1Database;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
}

export const DEFAULT_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Expose-Headers": "*",
};

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response("OK", {
        headers: DEFAULT_CORS_HEADERS,
      });
    }

    // Unauthenticated user

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
      if (url.pathname === "/categories") {
        switch (request.method) {
          case "GET":
            return getAllCategoriesHandler(env.DB);
          case "POST":
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
