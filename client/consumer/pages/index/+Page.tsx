import { useState, useEffect } from 'react'; // Import useState and useEffect
// Removed useData import
import { fetchQuote, type Quote } from "./+data"; // Import fetchQuote and Quote type
import LangSelector from '../components/LangSelector'; // Import LangSelector

const DEFAULT_LANG = "en"; // Define the default language constant

export default function Page() {
	const [selectedLang, setSelectedLang] = useState(DEFAULT_LANG); // Use constant for initial state
	const [quoteData, setQuoteData] = useState<Quote | null>(null); // Quote data state
	const [isLoading, setIsLoading] = useState(true); // Loading state
	const [error, setError] = useState<string | null>(null); // Error state

	// Effect to fetch quote when selectedLang changes
	useEffect(() => {
		const loadQuote = async () => {
			setIsLoading(true);
			setError(null);
			setQuoteData(null); // Clear previous quote while loading new one
			try {
				console.log(`Fetching quote for lang: ${selectedLang}`); // Log language being fetched
				const data = await fetchQuote(selectedLang);
				setQuoteData(data);
			} catch (err) {
				console.error("Error in fetchQuote:", err); // Log the actual error
				setError(err instanceof Error ? err.message : "Failed to fetch quote.");
			} finally {
				setIsLoading(false);
			}
		};

		loadQuote();
	}, [selectedLang]); // Dependency array includes selectedLang

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			{/* Language Selector */}
			<div className="absolute top-4 right-4">
				<LangSelector
					currentLang={selectedLang}
					onLangChange={setSelectedLang}
				/>
			</div>

			<h1 className={"font-bold text-3xl pb-4"}>
				Your daily dose of inspiration.
			</h1>

			{/* Conditional Rendering based on state */}
			{isLoading && <p>Loading your inspiration...</p>}
			{error && <p className="text-red-500">Error: {error}</p>}
			{!isLoading && !error && quoteData && (
				<div className="card shadow-md bg-base-100 max-w-lg">
					<div className="card-body">
						<h2 className="card-title text-center">{quoteData.quote}</h2>
						<p className="text-right italic">-{quoteData.author}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
