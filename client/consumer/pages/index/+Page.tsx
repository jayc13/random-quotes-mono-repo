import { useData } from "vike-react/useData";
import type { Data } from "./+data";

export default function Page() {
	const quote = useData<Data>();
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className={"font-bold text-3xl pb-4"}>
				Your daily dose of inspiration.
			</h1>
			<div className="stack">
				<div className="card shadow-md bg-base-100">
					<div className="card-body">
						<h2 className="card-title">{quote.quote}</h2>
						<p>{quote.author}</p>
					</div>
				</div>
				<div className="card shadow-md bg-base-100" />
				<div className="card shadow-md bg-base-100" />
			</div>
		</div>
	);
}
