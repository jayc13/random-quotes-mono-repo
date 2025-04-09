import { Request } from 'itty-router';
import { verifyAuth, isAdmin } from '../index'; // Import auth functions

export const handler = async (request: Request, env: any): Promise<Response> => {
  try {
    const { name, category_id } = await request.json();
    let query = "INSERT INTO Quotes (name";
    let values = [name];
    if (category_id !== undefined) {
      query += ", category_id";
      values.push(category_id);
    }
    query += ") VALUES (" + values.map(() => "?").join(", ") + ")";
    const { lastRowId } = await env.DB.prepare(query).bind(...values).run();
    return new Response(JSON.stringify({ id: lastRowId, name, category_id }), { status: 201 });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: error.status || 500 });
  }
};
