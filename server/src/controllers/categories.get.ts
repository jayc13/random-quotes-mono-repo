import { Request } from 'itty-router';

export async function handler(request: Request, env: { DB: D1Database }): Promise<Response> {
  try {
    const { results } = await env.DB.prepare("SELECT * FROM Categories").all();
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
