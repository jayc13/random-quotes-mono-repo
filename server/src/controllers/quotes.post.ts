import { Request } from 'itty-router';
import { verifyAuth, isAdmin } from '../index'; // Import auth functions

export const handler = async (request: Request, env: any): Promise<Response> => {
  try {
    await verifyAuth(request, env, true); // Admin only
    const { name } = await request.json();
    const { lastRowId } = await env.DB.prepare("INSERT INTO Quotes (name) VALUES (?)").bind(name).run();
    return new Response(JSON.stringify({ id: lastRowId, name }), { status: 201 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 });
  }
};
