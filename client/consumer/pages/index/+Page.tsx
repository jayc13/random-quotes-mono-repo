import React from "react";
import { useData } from "vike-react/useData";
import type { Data } from "./+data";
import LangSelector, { DEFAULT_LANG } from "../../components/LangSelector";
import CategoryFilter from "../../components/CategoryFilter"; // Import CategoryFilter
import { usePageContext } from "vike-react/usePageContext";

export default function Page() {
	const [isLoading, setIsLoading] = React.useState(false);
	const { urlParsed } = usePageContext();

	// Extract both lang and categoryId from search params
	const { lang = DEFAULT_LANG, categoryId = null } = urlParsed?.search || {};

	const quote = useData<Data>();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<span className="loading loading-spinner loading-lg" />
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center h-screen px-4">
			<div className="absolute top-4 left-4">
				<LangSelector
					currentLang={lang}
					onLangChange={(langCode) => {
						const newUrl = new URL(window.location.href);
						newUrl.searchParams.set("lang", langCode);
						window.location.href = newUrl.toString();
						setIsLoading(true);
					}}
				/>
				{/* Add CategoryFilter below LangSelector */}
				<CategoryFilter
					currentCategoryId={categoryId}
					onCategoryChange={(newCategoryId) => {
						const newUrl = new URL(window.location.href);
						if (newCategoryId === null) {
							newUrl.searchParams.delete("categoryId"); // Remove if "All Categories"
						} else {
							newUrl.searchParams.set("categoryId", newCategoryId); // Set otherwise
						}
						window.location.href = newUrl.toString();
						setIsLoading(true);
					}}
					categories={[]}
				/>
			</div>

			<h1 className="font-bold pb-4" data-testid="main-heading">
				Your daily dose of inspiration.
			</h1>

			<div>
				<h2
					className="text-center text-4xl codicon-italic font-sans antialiased"
					data-testid="quote"
				>
					<q>{quote.quote}</q>
				</h2>
				<p
					className="text-center italic mt-4 color-secondary font-extralight"
					data-testid="author"
				>
					- {quote.author}
				</p>
			</div>
		</div>
	);
}
