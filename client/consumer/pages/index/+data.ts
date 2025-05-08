import type { Quote } from "./types.js";
import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { DEFAULT_LANG } from "../../components/LangSelector";

export type Data = Awaited<ReturnType<typeof data>>;

const BASE_DATA_API: string = import.meta.env.VITE_DATA_API || "";
const DATA_API_KEY: string = import.meta.env.VITE_DATA_API_KEY || "";

export const data = async (pageContext: PageContextServer) => {
	// Extract both lang and categoryId from search params
	const { lang = DEFAULT_LANG, categoryId } = pageContext.urlParsed.search;

	const requestOptions = {
		headers: {
			"API-Token": DATA_API_KEY,
		},
	};

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
		fetch(randomQuoteUrl, requestOptions),
		fetch(`${BASE_DATA_API}/categories`, requestOptions),
	]);

	console.log({ randomQuoteResponse });

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
