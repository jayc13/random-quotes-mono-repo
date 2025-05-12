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
  deleteUserAccountHandler,
  sendForgotPasswordEmailHandler,
  updateUserNameHandler,
} from "@/controllers/user.controller";

import { accessControlMiddleware } from "@/middlewares/accessControl.middleware";
import { isAdminMiddleware } from "@/middlewares/admin.middleware";
import { authenticationMiddleware } from "@/middlewares/authentication.middleware";
import { requireUserAuthMiddleware } from "@/middlewares/userAuth.middleware";
import { validateIdParam } from "@/middlewares/validation.middleware";
import type { CategoryInput } from "@/types/category.types";
import type { QuoteInput } from "@/types/quote.types";
import { type IRequest, Router, cors, error } from "itty-router";

const { preflight, corsify } = cors({
  origin: "*", // Allow all origins
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Content-Range", "X-Total-Count"],
});

// Create a new router instance
const router = Router({
  base: "/",
  preflight,
  cors: corsify,
});

// --- Public Routes (No Authentication Middleware here, handled globally before router) ---
router.get(
  "/random",
  accessControlMiddleware,
  authenticationMiddleware,
  getRandomQuoteHandler,
);
router.get(
  "/categories",
  accessControlMiddleware,
  authenticationMiddleware,
  (request: IRequest, env: Env) => getAllCategoriesHandler(env.DB),
);
router.get(
  "/random.svg",
  accessControlMiddleware,
  authenticationMiddleware,
  (request: IRequest, env: Env) => getRandomQuoteSvgHandler(request, env.DB),
);
router.get(
  "/qotd",
  accessControlMiddleware,
  authenticationMiddleware,
  getQuoteOfTheDayHandler,
);

// --- Authenticated User Routes (Not Admin Specific) ---
// These routes require a user to be authenticated (i.e., ctx.props.user.sub must exist)
router.patch(
  "/users/me/name",
  requireUserAuthMiddleware,
  updateUserNameHandler,
);
router.post(
  "/users/me/forgot-password",
  requireUserAuthMiddleware,
  sendForgotPasswordEmailHandler,
);
router.delete("/users/me", requireUserAuthMiddleware, deleteUserAccountHandler);

// --- Admin Routes ---

// Categories Admin
router.post(
  "/categories",
  authenticationMiddleware,
  isAdminMiddleware,
  async (request: IRequest, env: Env) => {
    const requestBody = await request.json<CategoryInput>();
    return createCategoryHandler(env.DB, requestBody);
  },
);

router.all("/categories/:id", validateIdParam); // Validate ID for all /categories/:id routes
router.get(
  "/categories/:id",
  authenticationMiddleware,
  isAdminMiddleware,
  (request: IRequest, env: Env) => {
    const categoryId = Number.parseInt(request.params.id, 10);
    return getCategoryByIdHandler(env.DB, categoryId);
  },
);
router.put(
  "/categories/:id",
  authenticationMiddleware,
  isAdminMiddleware,
  async (request: IRequest, env: Env) => {
    const categoryId = Number.parseInt(request.params.id, 10);
    const requestBody = await request.json<CategoryInput>();
    return updateCategoryHandler(env.DB, categoryId, requestBody);
  },
);
router.patch(
  "/categories/:id",
  authenticationMiddleware,
  isAdminMiddleware,
  async (request: IRequest, env: Env) => {
    // Alias for PUT
    const categoryId = Number.parseInt(request.params.id, 10);
    const requestBody = await request.json<CategoryInput>();
    return updateCategoryHandler(env.DB, categoryId, requestBody);
  },
);
router.delete(
  "/categories/:id",
  authenticationMiddleware,
  isAdminMiddleware,
  (request: IRequest, env: Env) => {
    const categoryId = Number.parseInt(request.params.id, 10);
    return deleteCategoryHandler(env.DB, categoryId);
  },
);

// Quotes Admin
router.get(
  "/quotes",
  authenticationMiddleware,
  isAdminMiddleware,
  (request: IRequest, env: Env) => getAllQuotesHandler(request, env.DB),
);
router.post(
  "/quotes",
  authenticationMiddleware,
  isAdminMiddleware,
  async (request: IRequest, env: Env) => {
    const requestBody = await request.json<QuoteInput>();
    return createQuoteHandler(env.DB, requestBody);
  },
);

router.all("/quotes/:id", validateIdParam); // Validate ID for all /quotes/:id routes
router.get(
  "/quotes/:id",
  authenticationMiddleware,
  isAdminMiddleware,
  (request: IRequest, env: Env) => {
    const quoteId = Number.parseInt(request.params.id, 10);
    return getQuoteByIdHandler(env.DB, quoteId);
  },
);
router.put(
  "/quotes/:id",
  authenticationMiddleware,
  isAdminMiddleware,
  async (request: IRequest, env: Env) => {
    const quoteId = Number.parseInt(request.params.id, 10);
    const requestBody = await request.json<QuoteInput>();
    return updateQuoteHandler(env.DB, quoteId, requestBody);
  },
);
router.patch(
  "/quotes/:id",
  authenticationMiddleware,
  isAdminMiddleware,
  async (request: IRequest, env: Env) => {
    const quoteId = Number.parseInt(request.params.id, 10);
    const requestBody = await request.json<QuoteInput>();
    return updateQuoteHandler(env.DB, quoteId, requestBody);
  },
);
router.delete(
  "/quotes/:id",
  authenticationMiddleware,
  isAdminMiddleware,
  (request: IRequest, env: Env) => {
    const quoteId = Number.parseInt(request.params.id, 10);
    return deleteQuoteHandler(env.DB, quoteId);
  },
);

// API Tokens
router.get("/api-tokens", authenticationMiddleware, getUserApiTokensHandler);
router.post("/api-tokens", authenticationMiddleware, createApiTokenHandler);
router.delete(
  "/api-tokens/:id",
  authenticationMiddleware,
  validateIdParam,
  (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const tokenId = Number.parseInt(request.params.id, 10);
    return deleteApiTokenHandler(request, env, ctx, tokenId);
  },
);

// --- Default 404 Handler ---
router.all("*", () =>
  error(404, {
    success: false,
    error: "Not Found. The requested resource was not found.",
  }),
);

export default router;
