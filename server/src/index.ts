/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import {
	createCategoryHandler,
	deleteCategoryHandler,
	getAllCategoriesHandler,
	getCategoryByIdHandler,
	updateCategoryHandler,
} from "./controller/category.controller";
import {CategoryInput} from "./services/category.service";
import {authenticationMiddleware, isAdmin} from "./middleware/authentication.middleware";

export interface Env {
	// If you set another name in the Wrangler config file for the value for 'binding',
	// replace "DB" with the variable name you defined.
	DB: D1Database;
	AUTH0_CLIENT_SECRET: string;
	AUTH0_DOMAIN: string;
	AUTH0_CLIENT_ID: string;
}

export const DEFAULT_CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': '*',
	'Access-Control-Expose-Headers': '*',
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response("OK", {
				headers: DEFAULT_CORS_HEADERS
			});
		}

		// Unauthenticated user

		try {
			await authenticationMiddleware(request, env, ctx);
		} catch {
			return Response.json({
				error: 'Unauthorized',
				message: 'Authentication failed.',
			}, {status: 401});
		}

		// Regular authenticated user

		if (!await isAdmin(ctx)) {
			return Response.json({
				error: 'Forbidden',
				message: 'You do not have permission to perform this action.',
			}, {status: 403});
		}

		// Admin authenticated user

		try {
			if (url.pathname === '/categories') {
				switch (request.method) {
					case 'GET':
						if (url.pathname === '/categories') {
							return getAllCategoriesHandler(env.DB);
						}
						break;
					case 'POST':
						try {
							const requestBody = await request.json<CategoryInput>();

							return createCategoryHandler(env.DB, requestBody);
						} catch {
							return Response.json('Invalid JSON', {
								status: 400,
								headers: DEFAULT_CORS_HEADERS
							});
						}
				}
			}

			if (url.pathname.startsWith('/categories/')) {
				const categoryId: number = parseInt(url.pathname.split('/')[2]);
				switch (request.method) {
					case 'PUT':
						const requestBody = await request.json<CategoryInput>();
						if (!requestBody.name) {
							return Response.json('Invalid request body', {status: 400});
						}
						return updateCategoryHandler(env.DB, categoryId, requestBody);
					case 'GET':
						return getCategoryByIdHandler(env.DB, categoryId);
					case 'DELETE':
						return deleteCategoryHandler(env.DB, categoryId);
				}
			}

			if (url.pathname === '/quotes') {
				switch (request.method) {
					case 'GET':
						return getAllQuotesHandler(env.DB);
					case 'POST':
						try {
							const requestBody = await request.json<QuoteInput>();
							return createQuoteHandler(env.DB, requestBody);
						} catch {
							return Response.json('Invalid JSON', {
								status: 400,
								headers: DEFAULT_CORS_HEADERS
							});
						}
				}
			}

			if (url.pathname.startsWith('/quotes/')) {
				const quoteId: number = parseInt(url.pathname.split('/')[2]);
				switch (request.method) {
					case 'PUT':
						const requestBody = await request.json<QuoteInput>();
						return updateQuoteHandler(env.DB, quoteId, requestBody);
					case 'GET':
						return getQuoteByIdHandler(env.DB, quoteId);
					case 'DELETE':
						return deleteQuoteHandler(env.DB, quoteId);
				}
			}
		} catch (error) {
			console.error('Error handling request:', error);
			return Response.json({
				error: 'Internal Server Error',
				message: 'An unexpected error occurred while processing your request.',
			}, {
				status: 500,
				headers: DEFAULT_CORS_HEADERS
			});
		}

		return Response.json({
			error: 'Not Found',
			message: 'The requested resource was not found.',
		}, {status: 404});
	},
} satisfies ExportedHandler<Env>;
