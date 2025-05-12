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
  updateUserNameHandler, 
  sendForgotPasswordEmailHandler, 
  deleteUserAccountHandler 
} from "@/controllers/user.controller";
import { authenticationMiddleware } from "@/middlewares/authentication.middleware";
import { isAdminMiddleware } from "@/middlewares/admin.middleware";
import { requireUserAuthMiddleware } from "@/middlewares/userAuth.middleware"; // Refactored
import { validateIdParam } from "@/middlewares/validation.middleware"; // Refactored
import type { CategoryInput } from "@/types/category.types";
import type { QuoteInput } from "@/types/quote.types";
import { DEFAULT_CORS_HEADERS } from "@/utils/constants";
import { IRequest, Router, error, json } from "itty-router";
import { Env } from "./types/env.types"; // Ensure Env is correctly imported
import { ExecutionContext } from "@cloudflare/workers-types";

// Create a new router instance
const router = Router();

// --- Global Pre-flight OPTIONS Handler ---
router.options("*", () => new Response("OK", { headers: DEFAULT_CORS_HEADERS }));

// --- Public Routes (No Authentication Middleware here, handled globally before router) ---
router.get("/random", getRandomQuoteHandler); // (request, env)
router.get("/categories", (request: IRequest, env: Env, ctx: ExecutionContext) => getAllCategoriesHandler(env.DB));
router.get("/random.svg", (request: IRequest, env: Env, ctx: ExecutionContext) => getRandomQuoteSvgHandler(request, env.DB));
router.get("/qotd", getQuoteOfTheDayHandler); // (request, env)


// --- Authenticated User Routes (Not Admin Specific) ---
// These routes require a user to be authenticated (i.e., ctx.props.user.sub must exist)
router.patch("/users/me/name", requireUserAuthMiddleware, updateUserNameHandler);
router.post("/users/me/forgot-password", requireUserAuthMiddleware, sendForgotPasswordEmailHandler);
router.delete("/users/me", requireUserAuthMiddleware, deleteUserAccountHandler);


// --- Admin Routes ---
// All routes below this will first check for user authentication (implicit via global middleware), 
// then specifically check for admin privileges using isAdminMiddleware.

// Categories Admin
router.post("/categories", isAdminMiddleware, async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const requestBody = await request.json<CategoryInput>();
  return createCategoryHandler(env.DB, requestBody);
});

router.all("/categories/:id", isAdminMiddleware, validateIdParam); // Validate ID for all /categories/:id routes
router.get("/categories/:id", isAdminMiddleware, (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const categoryId = Number.parseInt(request.params.id, 10);
  return getCategoryByIdHandler(env.DB, categoryId);
});
router.put("/categories/:id", isAdminMiddleware, async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const categoryId = Number.parseInt(request.params.id, 10);
  const requestBody = await request.json<CategoryInput>();
  return updateCategoryHandler(env.DB, categoryId, requestBody);
});
router.patch("/categories/:id", isAdminMiddleware, async (request: IRequest, env: Env, ctx: ExecutionContext) => { // Alias for PUT
  const categoryId = Number.parseInt(request.params.id, 10);
  const requestBody = await request.json<CategoryInput>();
  return updateCategoryHandler(env.DB, categoryId, requestBody);
});
router.delete("/categories/:id", isAdminMiddleware, (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const categoryId = Number.parseInt(request.params.id, 10);
  return deleteCategoryHandler(env.DB, categoryId);
});


// Quotes Admin
router.get("/quotes", isAdminMiddleware, (request: IRequest, env: Env, ctx: ExecutionContext) => getAllQuotesHandler(request, env.DB));
router.post("/quotes", isAdminMiddleware, async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const requestBody = await request.json<QuoteInput>();
  return createQuoteHandler(env.DB, requestBody);
});

router.all("/quotes/:id", isAdminMiddleware, validateIdParam); // Validate ID for all /quotes/:id routes
router.get("/quotes/:id", isAdminMiddleware, (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const quoteId = Number.parseInt(request.params.id, 10);
  return getQuoteByIdHandler(env.DB, quoteId);
});
router.put("/quotes/:id", isAdminMiddleware, async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const quoteId = Number.parseInt(request.params.id, 10);
  const requestBody = await request.json<QuoteInput>();
  return updateQuoteHandler(env.DB, quoteId, requestBody);
});
router.patch("/quotes/:id", isAdminMiddleware, async (request: IRequest, env: Env, ctx: ExecutionContext) => { // Alias for PUT
  const quoteId = Number.parseInt(request.params.id, 10);
  const requestBody = await request.json<QuoteInput>();
  return updateQuoteHandler(env.DB, quoteId, requestBody);
});
router.delete("/quotes/:id", isAdminMiddleware, (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const quoteId = Number.parseInt(request.params.id, 10);
  return deleteQuoteHandler(env.DB, quoteId);
});


// API Tokens Admin
router.get("/api-tokens", isAdminMiddleware, getUserApiTokensHandler);
router.post("/api-tokens", isAdminMiddleware, createApiTokenHandler);

router.all("/api-tokens/:id", isAdminMiddleware, validateIdParam); // Validate ID for /api-tokens/:id
router.delete("/api-tokens/:id", isAdminMiddleware, (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const tokenId = Number.parseInt(request.params.id, 10);
  return deleteApiTokenHandler(request, env, ctx, tokenId);
});


// --- Default 404 Handler ---
router.all("*", () => error(404, { success: false, error: "Not Found. The requested resource was not found." }, { headers: DEFAULT_CORS_HEADERS }));


export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Run global middlewares that attach props to ctx or request
    // These middlewares modify ctx.props
    try {
      await accessControlMiddleware(request as IRequest, env, ctx);
      await authenticationMiddleware(request as IRequest, env, ctx); // Populates ctx.props.user
    } catch (e: any) {
      console.error("Global middleware error:", e.message);
      return error(500, { success: false, error: "Middleware processing failed", details: e.message }, { headers: DEFAULT_CORS_HEADERS });
    }
    
    if (!ctx.props.accessGranted || !ctx.props.originAllowed) {
      return error(401, { success: false, error: "Unauthorized. Access control failed." }, { headers: DEFAULT_CORS_HEADERS });
    }
    
    // itty-router handlers expect (request, env, ctx)
    // The router.handle method will pass these through.
    return router.handle(request as IRequest, env, ctx)
      .catch(err => {
        // This catch is for unexpected errors *during* router handling or if a route itself throws.
        // itty-router's error() helper or direct Response.json() in routes should ideally handle known errors.
        console.error("Router execution error:", err);
        const statusCode = err.status || 500;
        const message = err.message || "Internal Server Error";
        const details = err.error || err.details || "An unexpected error occurred.";
        // Ensure DEFAULT_CORS_HEADERS are applied to error responses
        return new Response(JSON.stringify({ success: false, error: message, details: details }), { 
          status: statusCode, 
          headers: { ...DEFAULT_CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      });
  }
} satisfies ExportedHandler<Env>;
