import { Request } from 'itty-router';
import { verifyAuth, isAdmin } from '../index'; // Import auth functions

export const handler = async (request: Request, env: any): Promise<Response> => {
  try {
    const id = parseInt(request.params?.id as string);
    const { name, category_id } = await request.json();
    let query = "UPDATE Quotes SET name = ?";
    let values = [name];
    if (category_id !== undefined) {
      query += ", category_id = ?";
      values.push(category_id);
    }
    query += " WHERE id = ?";
    values.push(id);
    await env.DB.prepare(query).bind(...values).run();
    return new Response(JSON.stringify({ id, name, category_id }));
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 });
  }
};
