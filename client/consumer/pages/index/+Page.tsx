import React, { useState, Suspense } from "react";
import { useData } from "vike-react/useData";
import type { Data } from "./+data";
import LangSelector, { DEFAULT_LANG } from "../../components/LangSelector";
import CategoryFilter from "../../components/CategoryFilter";
import ThemeController from "../../components/ThemeController";
import QuoteCard from "../../components/QuoteCard";
import { usePageContext } from "vike-react/usePageContext";
import { getRandomQuote } from "./quote.telefunc";

export default function Page() {
	const [isLoading, setIsLoading] = useState(false);
	const { urlParsed } = usePageContext();
	const { quote: initialQuote, categories } = useData<Data>();
	const [currentQuote, setCurrentQuote] = useState(initialQuote);
	const [error, setError] = useState(null);

	// Extract both lang and categoryId from search params
	const { lang = DEFAULT_LANG, categoryId = null } = urlParsed?.search || {};

	const [activeLang, setActiveLang] = useState(lang);
	const [activeCategoryId, setActiveCategoryId] = useState(categoryId);

	const handleQuoteChange = async () => {
		setIsLoading(true);
		try {
			const newQuote = await getRandomQuote({
				lang: activeLang,
				categoryId: activeCategoryId,
			});
			setCurrentQuote(newQuote);
			setError(null); // Reset error state on successful fetch
		} catch (error) {
			setError("Failed to fetch new quote");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen px-4 bg-gray-500/25">
			<div className="absolute top-4 left-4">
				<LangSelector
					currentLang={lang}
					onLangChange={async (langCode) => {
						const newUrl = new URL(window.location.href);
						newUrl.searchParams.set("lang", langCode);
						setActiveLang(langCode);
						window.history.pushState({}, "", newUrl.toString());
						await handleQuoteChange();
					}}
				/>
			</div>
			<div className="absolute top-4 right-4">
				<CategoryFilter
					currentCategoryId={categoryId}
					onCategoryChange={async (newCategoryId) => {
						const newUrl = new URL(window.location.href);
						if (newCategoryId === null) {
							newUrl.searchParams.delete("categoryId"); // Remove if "All Categories"
						} else {
							newUrl.searchParams.set("categoryId", newCategoryId); // Set otherwise
						}
						setActiveCategoryId(newCategoryId);
						window.history.pushState({}, "", newUrl.toString());
						await handleQuoteChange();
					}}
					categories={categories}
				/>
			</div>

			<div className="absolute bottom-4 left-4">
				<button
					className="btn btn-ghost btn-circle bg-transparent"
					type="button"
					onClick={handleQuoteChange}
					data-testid="new-quote-button"
					disabled={isLoading}
				>
					<svg
						className="w-6 h-6 text-gray-800 dark:text-white"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
					>
						<title>Reload icon</title>
						<path
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
						/>
					</svg>
				</button>
			</div>

			<div className="absolute bottom-4 right-4">
				<ThemeController />
			</div>

			<h1 className="font-bold pb-4" data-testid="main-heading">
				Your daily dose of inspiration.
			</h1>

			{
				// Use Suspense to handle loading state
				isLoading ? (
					<span className="loading loading-spinner loading-lg" />
				) : (
					<QuoteCard quote={currentQuote} />
				)
			}

			{
				// Show error message if there's an error
				error && (
					<div className="toast toast-center toast-bottom">
						<div role="alert" className="alert alert-error">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6 shrink-0 stroke-current"
								fill="none"
								viewBox="0 0 24 24"
							>
								<title>Error icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<strong>Error!</strong> <span>{error}</span>
						</div>
					</div>
				)
			}
		</div>
	);
}
