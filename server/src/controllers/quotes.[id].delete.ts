import { Request } from 'itty-router';
import { verifyAuth, isAdmin } from '../index'; // Import auth functions

export const handler = async (request: Request, env: any): Promise<Response> => {
  try {
    await verifyAuth(request, env, true); // Admin only
    const id = parseInt(request.params?.id as string);
    await env.DB.prepare("DELETE FROM Quotes WHERE id = ?").bind(id).run();
    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 });
  }
};
