import React, { useEffect } from "react";
import { navigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";

export default function Page() {
	const { is404 } = usePageContext();

	useEffect(() => {
		if (is404) {
			navigate("/").then();
		}
	}, [is404]);

	if (is404) {
		return (
			<div className="flex items-center justify-center h-screen">
				<span className="loading loading-spinner loading-lg" />
			</div>
		);
	}

	// Keep the original non-404 error display logic
	return (
		<div className="toast toast-center toast-middle">
			<div role="alert" className="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					role="img"
					aria-label="Error"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>
					<strong>Something went wrong: </strong> Please try again later
				</span>
			</div>
		</div>
	);
}
