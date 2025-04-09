import { Request } from 'itty-router';

export async function handler(request: Request, env: { DB: D1Database }): Promise<Response> {
  try {
    const id = request.params?.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
    }
    const { name } = await request.json();
    if (!name) {
      return new Response(JSON.stringify({ error: "Name is required" }), { status: 400 });
    }
    const { success } = await env.DB.prepare("UPDATE Categories SET name = ? WHERE id = ?").bind(name, id).run();
    if (success) {
      return new Response(JSON.stringify({ message: "Category updated successfully" }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: "Category not found or update failed" }), { status: 404 });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
