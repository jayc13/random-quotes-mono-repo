import { Request } from 'itty-router';

export async function handler(request: Request, env: { DB: D1Database }): Promise<Response> {
  try {
    const id = request.params?.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
    }
    const { results } = await env.DB.prepare("SELECT * FROM Categories WHERE id = ?").bind(id).all();
    if (results && results.length > 0) {
      return new Response(JSON.stringify(results[0]), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: "Category not found" }), { status: 404 });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
