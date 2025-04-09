import { jwtVerify } from 'jose';
import { Request } from 'itty-router';
import { handler as quotesGetHandler } from './controllers/quotes.get';
import { handler as quotesPostHandler } from './controllers/quotes.post';
import { handler as quotesIdGetHandler } from './controllers/quotes.[id].get';
import { handler as quotesIdPutHandler } from './controllers/quotes.[id].put';
import { handler as quotesIdDeleteHandler } from './controllers/quotes.[id].delete';

export async function setup(env: { DB: D1Database }) {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS Quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);
}

export async function verifyAuth(request: Request, env: { AUTH0_DOMAIN: string, AUTH0_AUDIENCE: string, AUTH0_ADMIN_ROLE: string }, requireAdmin: boolean = false) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    throw { message: "Authorization header missing", status: 401 };
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw { message: "Token missing", status: 401 };
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(env.AUTH0_AUDIENCE), // Use audience as secret for HS256
      {
        issuer: `https://${env.AUTH0_DOMAIN}/`,
        audience: env.AUTH0_AUDIENCE,
      }
    );

    if (requireAdmin && !isAdmin(payload, env.AUTH0_ADMIN_ROLE)) {
      throw { message: "Insufficient permissions", status: 403 };
    }

    return payload;
  } catch (e: any) {
    console.error("JWT Verification Error:", e);
    throw { message: "Invalid token", status: 401 };
  }
}

export function isAdmin(payload: any, adminRole: string): boolean {
  return payload && payload[`${adminRole}`] === true;
}

export default {
  async fetch(request: Request, env: { DB: D1Database, AUTH0_DOMAIN: string, AUTH0_AUDIENCE: string, AUTH0_ADMIN_ROLE: string }): Promise<Response> {
    await setup(env); // Ensure table exists

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/quotes") {
        if (request.method === "GET") {
          return await quotesGetHandler(request, env);
        } else if (request.method === "POST") {
          return await quotesPostHandler(request, env);
        }
      } else if (path.startsWith("/quotes/")) {
        const id = url.pathname.substring(7);
        request.params = { id }; // Set id as a request parameter

        if (request.method === "GET") {
          return await quotesIdGetHandler(request, env);
        } else if (request.method === "PUT") {
          return await quotesIdPutHandler(request, env);
        } else if (request.method === "DELETE") {
          return await quotesIdDeleteHandler(request, env);
        }
      }
    } catch (error: any) {
      console.error(error);
      return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 });
    }

    return new Response("Not Found", { status: 404 });
  },
};
