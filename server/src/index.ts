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
	getAllCategoriesHandler,
	createCategoryHandler,
	getCategoryByIdHandler,
	deleteCategoryHandler,
	updateCategoryHandler,
} from "./controller/category.controller";
import {CategoryInput} from "./services/category.service";

export interface Env {
	// If you set another name in the Wrangler config file for the value for 'binding',
	// replace "DB" with the variable name you defined.
	DB: D1Database;
}


export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

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
						return new Response('Invalid JSON', {status: 400});
					}
				default:
					return new Response('Method Not Allowed', {status: 405});
			}
		}

		if (url.pathname.startsWith('/categories/')) {
			const categoryId: number = parseInt(url.pathname.split('/')[2]);
			switch (request.method) {
				case 'PUT':
					const requestBody = await request.json<CategoryInput>();
					if (!requestBody.name) {
						return new Response('Invalid request body', {status: 400});
					}
					return updateCategoryHandler(env.DB, categoryId, requestBody);
				case 'GET':
					return getCategoryByIdHandler(env.DB, categoryId);
				case 'DELETE':
					return deleteCategoryHandler(env.DB, categoryId);
				default:
					return new Response('Method Not Allowed', {status: 405});
			}
		}

		return new Response('Not Found', {status: 404});
	},
} satisfies ExportedHandler<Env>;
