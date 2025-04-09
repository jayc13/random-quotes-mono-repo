import { Request } from 'itty-router';

export async function handler(request: Request, env: { DB: D1Database }): Promise<Response> {
  try {
    const id = request.params?.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
    }
    const { success } = await env.DB.prepare("DELETE FROM Categories WHERE id = ?").bind(id).run();
    if (success) {
      return new Response(JSON.stringify({ message: "Category deleted successfully" }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: "Category not found or delete failed" }), { status: 404 });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
