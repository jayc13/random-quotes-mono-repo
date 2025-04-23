import type { Quote } from "./types.js";
import { render } from "vike/abort";

export type Data = Awaited<ReturnType<typeof data>>;

// const BASE_DATA_API = process.env.DATA_API || '';
const BASE_DATA_API = import.meta.env.VITE_DATA_API || '';

console.log({BASE_DATA_API})

export const data = async () => {
	const response = await fetch(`${BASE_DATA_API}/random`);

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
