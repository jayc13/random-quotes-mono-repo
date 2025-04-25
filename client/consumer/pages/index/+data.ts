import type { Quote } from "./types.js";
import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { DEFAULT_LANG } from "../../components/LangSelector";

export type Data = Awaited<ReturnType<typeof data>>;

const BASE_DATA_API = import.meta.env.VITE_DATA_API || "";

export const data = async (pageContext: PageContextServer) => {
	// Extract both lang and categoryId from search params
	const { lang = DEFAULT_LANG, categoryId } = pageContext.urlParsed.search;

	// Use URLSearchParams for cleaner query parameter handling
	const searchParams = new URLSearchParams();

	// Add lang if it's not the default
	if (lang && lang !== DEFAULT_LANG) {
		searchParams.set("lang", lang);
	}

	// Add categoryId if it exists
	if (categoryId) {
		searchParams.set("categoryId", categoryId);
	}

	// Construct the final API URL
	let randomQuoteUrl = `${BASE_DATA_API}/random`;
	const queryString = searchParams.toString();
	if (queryString) {
		randomQuoteUrl += `?${queryString}`;
	}

	const [randomQuoteResponse, categoriesResponse] = await Promise.all([
		fetch(randomQuoteUrl),
		fetch(`${BASE_DATA_API}/categories`),
	]);

	if (!randomQuoteResponse.ok || !categoriesResponse.ok) {
		throw render(500, "Error fetching quote");
	}

	const { id, quote, author } = await randomQuoteResponse.json();
	const categories = await categoriesResponse.json();

	return {
		quote: {
			id,
			quote,
			author,
		} as Quote,
		categories,
	};
};
