import React from "react";

const QuoteCard = ({ quote }) => {
	return (
		<div>
			<h2
				className="text-center text-2xl sm:text-4xl codicon-italic font-sans antialiased"
				data-testid="quote"
			>
				<q>{quote.quote}</q>
			</h2>
			<p
				className="text-center italic mt-2 sm:mt-4 text-lg sm:text-xl color-secondary font-extralight"
				data-testid="author"
			>
				- {quote.author}
			</p>
		</div>
	);
};

export default QuoteCard;
