import type { Quote } from "./types.js";
import { render } from "vike/abort"; // Keep render for potential server-side errors if needed elsewhere, or remove if purely client-side now

// Export the Quote type if not already exported from types.js
export type { Quote };

const BASE_DATA_API = import.meta.env.VITE_DATA_API || "";

// Rename and export the data fetching function directly
export async function fetchQuote(lang?: string): Promise<Quote> {
	// Construct the API URL based on the presence of the lang parameter
	let apiUrl = `${BASE_DATA_API}/random`;
	if (lang && lang !== 'en') { // Assuming 'en' is default and doesn't need param
		apiUrl += `?lang=${lang}`;
	}

	const response = await fetch(apiUrl); // Use the dynamically constructed URL

	if (!response.ok) {
		// Restore Vike error handling and use the exact error message
		throw render(500, "Error fetching quote");
	}

	// Assuming the API returns { id, quote, author } directly
	const quoteData: Quote = await response.json();

	return quoteData;
}
