import { Request } from 'itty-router';

export async function handler(request: Request, env: { DB: D1Database }): Promise<Response> {
  try {
    const { name } = await request.json();
    if (!name) {
      return new Response(JSON.stringify({ error: "Name is required" }), { status: 400 });
    }
    const { success } = await env.DB.prepare("INSERT INTO Categories (name) VALUES (?)").bind(name).run();
    if (success) {
      return new Response(JSON.stringify({ message: "Category created successfully" }), { status: 201 });
    } else {
      throw new Error("Failed to create category");
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
