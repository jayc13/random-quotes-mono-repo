import React from "react";
import { useData } from "vike-react/useData";
import type {Data} from "./+data";
import LangSelector, {DEFAULT_LANG} from "../../components/LangSelector";
import {usePageContext} from "vike-react/usePageContext";

export default function Page() {
	const [isLoading, setIsLoading] = React.useState(false);
	const { urlParsed } = usePageContext();

	const {
		lang = DEFAULT_LANG
	} = urlParsed?.search || {};

	const quote = useData<Data>();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center h-screen">
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
			</div>

			<h1 className={"font-bold text-3xl pb-4"}>
				Your daily dose of inspiration.
			</h1>

			<div className="card shadow-md bg-base-100 max-w-lg">
				<div className="card-body">
					<h2 className="card-title text-center">{quote.quote}</h2>
					<p className="text-right italic">-{quote.author}</p>
				</div>
			</div>
		</div>
	);
}
