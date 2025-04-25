import { render } from "vike/abort";

export interface RandomQuoteFilter {
	lang: string;
	categoryId: string | null;
}

const BASE_DATA_API = import.meta.env.VITE_DATA_API || "";

async function getRandomQuote(filters: RandomQuoteFilter) {
	const { lang, categoryId } = filters;

	const randomQuoteUrl = `${BASE_DATA_API}/random`;
	// const queryString = searchParams.toString();
	// if (queryString) {
	//   randomQuoteUrl += `?${queryString}`;
	// }

	const randomQuoteResponse = await fetch(randomQuoteUrl);

	if (!randomQuoteResponse.ok) {
		throw render(500, "Error fetching quote");
	}

	const { id, quote, author } = await randomQuoteResponse.json();

	return {
		id,
		quote,
		author,
	};
}

export { getRandomQuote };
