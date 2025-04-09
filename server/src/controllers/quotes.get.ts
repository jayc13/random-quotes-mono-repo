import { Request } from 'itty-router';

export const handler = async (request: Request, env: any): Promise<Response> => {
  try {
    const { results } = await env.DB.prepare("SELECT * FROM Quotes").all();
    return new Response(JSON.stringify(results));
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 });
  }
};
