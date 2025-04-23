import { useState, useEffect } from "react";
import { fetchQuote, type Quote } from "./+data";
import LangSelector from "../../components/LangSelector";

const DEFAULT_LANG = "en"; // Define the default language constant

export default function Page() {
	const [selectedLang, setSelectedLang] = useState(DEFAULT_LANG);
	const [quoteData, setQuoteData] = useState<Quote | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadQuote = async () => {
			setIsLoading(true);
			setError(null);
			setQuoteData(null);
			try {
				const data = await fetchQuote(selectedLang);
				setQuoteData(data);
			} catch {
				setError("Failed to fetch quote.");
			} finally {
				setIsLoading(false);
			}
		};

		loadQuote().then();
	}, [selectedLang]);

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<div className="absolute top-4 right-4">
				<LangSelector
					currentLang={selectedLang}
					onLangChange={setSelectedLang}
				/>
			</div>

			<h1 className={"font-bold text-3xl pb-4"}>
				Your daily dose of inspiration.
			</h1>

			{isLoading && <p>Loading your inspiration...</p>}
			{error && <p className="text-red-500">Error: {error}</p>}
			{!isLoading && !error && quoteData && (
				<div className="card shadow-md bg-base-100 max-w-lg">
					<div className="card-body">
						<h2 className="card-title text-center">{quoteData.quote}</h2>
						<p className="text-right italic">-{quoteData.author}</p>
					</div>
				</div>
			)}
		</div>
	);
}
