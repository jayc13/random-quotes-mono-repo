import {createQuote, deleteQuote, getAllQuotes, getQuoteById, updateQuote,} from "../services/quote.service";
import {DEFAULT_CORS_HEADERS} from "../index";

export const getAllQuotesHandler = async (db: D1Database) => {
	const quotes = await getAllQuotes(db);
	return Response.json(quotes, {
		headers: {
			...DEFAULT_CORS_HEADERS,
			"Content-Range": `quotes 0-${quotes.length}/${quotes.length}`,
			"X-Total-Count": `${quotes.length}`,
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
