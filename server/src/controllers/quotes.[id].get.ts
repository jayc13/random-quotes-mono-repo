import { Request } from 'itty-router';

export const handler = async (request: Request, env: any): Promise<Response> => {
  try {
    const id = parseInt(request.params?.id as string);
    const { results } = await env.DB.prepare("SELECT * FROM Quotes WHERE id = ?").bind(id).all();
    if (results && results.length > 0) {
      return new Response(JSON.stringify(results[0]));
    } else {
      return new Response("Quote not found", { status: 404 });
    }
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 });
  }
};
