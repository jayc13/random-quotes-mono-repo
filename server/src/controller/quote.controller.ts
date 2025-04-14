import {
	createQuote,
	deleteQuote,
	getAllQuotes,
	getCountQuotes,
	getQuoteById,
	updateQuote,
} from "../services/quote.service";
import {DEFAULT_CORS_HEADERS} from "../index";

export const getAllQuotesHandler = async (request: Request, db: D1Database) => {
	const url = new URL(request.url);
	const start = parseInt(url.searchParams.get("_start") || "0", 10);
	const end = parseInt(url.searchParams.get("_end") || "10", 10);
	const limit = end - start;
	const offset = start;
	const count: number = await getCountQuotes(db);
	const quotes = await getAllQuotes(db, {limit, offset});
	return Response.json(quotes, {
		headers: {
			...DEFAULT_CORS_HEADERS,
			"Content-Range": `quotes 0-${quotes.length}/${quotes.length}`,
			"X-Total-Count": `${count}`,
		},
	});
};

export const getQuoteByIdHandler = async (db: D1Database, id: number) => {
	const quote = await getQuoteById(db, id);
	if (!quote) {
		return new Response("Quote not found", {
			status: 404,
			headers: DEFAULT_CORS_HEADERS,
		});
	}
	return Response.json(quote, {
		headers: DEFAULT_CORS_HEADERS,
	});
};

export const createQuoteHandler = async (
	db: D1Database,
	quote: { quote: string; author: string; categoryId: number }
) => {
	const newQuote = await createQuote(db, quote);
	return Response.json(newQuote, {
		status: 201,
		headers: DEFAULT_CORS_HEADERS,
	});
};

export const updateQuoteHandler = async (
	db: D1Database,
	id: number,
	quote: { quote: string; author: string; categoryId: number }
) => {
	const updatedQuote = await updateQuote(db, id, quote);
	if (!updatedQuote) {
		return new Response("Quote not found", {
			status: 404,
			headers: DEFAULT_CORS_HEADERS,
		});
	}
	return Response.json(updatedQuote, {
		headers: DEFAULT_CORS_HEADERS,
	});
};

export const deleteQuoteHandler = async (db: D1Database, id: number) => {
	const success = await deleteQuote(db, id);
	if (!success) {
		return new Response("Quote not found", {
			status: 404,
			headers: DEFAULT_CORS_HEADERS,
		});
	}
	return new Response(null, {
		status: 204,
		headers: DEFAULT_CORS_HEADERS,
	});
};
