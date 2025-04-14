export interface Quote {
	id: number;
	quote: string;
	author: string;
	categoryId: number;
}

export interface QuoteInput {
	quote: string;
	author: string;
	categoryId: number;
}

export const getAllQuotes = async (db: D1Database): Promise<Quote[]> => {
	const {results} = await db.prepare(
		"SELECT * FROM Quotes"
	).all();

	return results.map(r => ({
		id: r.QuoteId as number,
		quote: r.QuoteText as string,
		author: r.QuoteAuthor as string,
		categoryId: r.QuoteCategoryId as number,
	}));
};

export const getQuoteById = async (db: D1Database, id: number): Promise<Quote | null> => {
	const {results} = await db.prepare(
		"SELECT * FROM Quotes WHERE QuoteId = ?"
	).bind(id).all();

	if (results.length === 0) {
		return null;
	}

	const r = results[0];
	return {
		id: r.QuoteId as number,
		quote: r.QuoteText as string,
		author: r.QuoteAuthor as string,
		categoryId: r.QuoteCategoryId as number,
	};
};

export const validateQuoteInput = (input: QuoteInput): boolean => {
	return !(
		!input ||
		!input.quote ||
		input.quote.trim().length === 0 ||
		input.quote.length > 250 ||
		!input.author ||
		input.author.trim().length === 0 ||
		input.author.length > 100 ||
		!input.categoryId
	);
};

export const createQuote = async (db: D1Database, input: QuoteInput): Promise<Quote> => {
	const {quote, author, categoryId} = input;

	if (!validateQuoteInput(input)) {
		throw new Error('Invalid quote input');
	}

	const result = await db.prepare(
		"INSERT INTO Quotes (QuoteText, QuoteAuthor, QuoteCategoryId) VALUES (?, ?, ?)"
	).bind(quote, author, categoryId).run();

	const id: number = result.meta.last_row_id as number;

	return {
		id,
		quote,
		author,
		categoryId,
	};
};

export const updateQuote = async (db: D1Database, id: number, input: QuoteInput): Promise<Quote | null> => {
	const {quote, author, categoryId} = input;

	if (!validateQuoteInput(input)) {
		throw new Error('Invalid quote input');
	}

	await db.prepare(
		"UPDATE Quotes SET QuoteText = ?, QuoteAuthor = ?, QuoteCategoryId = ? WHERE QuoteId = ?"
	).bind(quote, author, categoryId, id).run();

	return getQuoteById(db, id);
};

export const deleteQuote = async (db: D1Database, id: number): Promise<boolean> => {
	const result = await db.prepare(
		"DELETE FROM Quotes WHERE QuoteId = ?"
	).bind(id).run();

	return result.success;
};
