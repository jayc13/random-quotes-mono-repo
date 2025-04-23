import type { Quote } from "./types.js";
import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { DEFAULT_LANG } from "../../components/LangSelector";

export type Data = Awaited<ReturnType<typeof data>>;

const BASE_DATA_API = import.meta.env.VITE_DATA_API || "";

export const data = async (pageContext: PageContextServer) => {
	const { lang = DEFAULT_LANG } = pageContext.urlParsed.search;

	let apiUrl = `${BASE_DATA_API}/random`;

	if (lang && lang !== "en") {
		apiUrl += `?lang=${lang}`;
	}

	const response = await fetch(apiUrl);

	if (!response.ok) {
		throw render(500, "Error fetching quote");
	}

	const { id, quote, author } = await response.json();

	return {
		id,
		quote,
		author,
	} as Quote;
};
