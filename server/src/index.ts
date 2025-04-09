import { jwtVerify } from 'jose';

export default {
  async fetch(request: Request, env: { DB: D1Database, AUTH0_DOMAIN: string, AUTH0_AUDIENCE: string, AUTH0_ADMIN_ROLE: string }): Promise<Response> {
    await this.setup(env); // Ensure table exists

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/quotes") {
        if (request.method === "GET") {
          // Read all quotes (Public - no auth needed)
          const { results } = await env.DB.prepare("SELECT * FROM Quotes").all();
          return new Response(JSON.stringify(results));
        } else if (request.method === "POST") {
          // Create a new quote (Admin only)
          await this.verifyAuth(request, env, true);
          const { name } = await request.json();
          const { lastRowId } = await env.DB.prepare("INSERT INTO Quotes (name) VALUES (?)").bind(name).run();
          return new Response(JSON.stringify({ id: lastRowId, name }), { status: 201 });
        }
      } else if (path.startsWith("/quotes/")) {
        const id = parseInt(path.substring(7)); // Extract ID from path

        if (request.method === "GET") {
          // Read a specific quote (Public - no auth needed)
          const { results } = await env.DB.prepare("SELECT * FROM Quotes WHERE id = ?").bind(id).all();
          if (results && results.length > 0) {
            return new Response(JSON.stringify(results[0]));
          } else {
            return new Response("Quote not found", { status: 404 });
          }
        } else if (request.method === "PUT") {
          // Update a quote (Admin only)
          await this.verifyAuth(request, env, true);
          const { name } = await request.json();
          await env.DB.prepare("UPDATE Quotes SET name = ? WHERE id = ?").bind(name, id).run();
          return new Response(JSON.stringify({ id, name }));
        } else if (request.method === "DELETE") {
          // Delete a quote (Admin only)
          await this.verifyAuth(request, env, true);
          await env.DB.prepare("DELETE FROM Quotes WHERE id = ?").bind(id).run();
          return new Response(null, { status: 204 });
        }
      }
    } catch (error: any) {
      console.error(error);
      return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 });
    }

    return new Response("Not Found", { status: 404 });
  },

  async setup(env: { DB: D1Database }) {
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS Quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `);
  },

  async verifyAuth(request: Request, env: { AUTH0_DOMAIN: string, AUTH0_AUDIENCE: string, AUTH0_ADMIN_ROLE: string }, requireAdmin: boolean = false) {
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

      if (requireAdmin && !this.isAdmin(payload, env.AUTH0_ADMIN_ROLE)) {
        throw { message: "Insufficient permissions", status: 403 };
      }

      return payload;
    } catch (e: any) {
      console.error("JWT Verification Error:", e);
      throw { message: "Invalid token", status: 401 };
    }
  },

  isAdmin(payload: any, adminRole: string): boolean {
    return payload && payload[`${adminRole}`] === true;
  },
};
