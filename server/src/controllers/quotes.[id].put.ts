import { Request } from 'itty-router';
import { verifyAuth, isAdmin } from '../index'; // Import auth functions

export const handler = async (request: Request, env: any): Promise<Response> => {
  try {
    await verifyAuth(request, env, true); // Admin only
    const id = parseInt(request.params?.id as string);
    const { name } = await request.json();
    await env.DB.prepare("UPDATE Quotes SET name = ? WHERE id = ?").bind(name, id).run();
    return new Response(JSON.stringify({ id, name }));
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 });
  }
};
