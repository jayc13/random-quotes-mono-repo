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
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className="size-6"
					>
						<title>Refresh icon</title>
						<path
							fillRule="evenodd"
							d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
							clipRule="evenodd"
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
