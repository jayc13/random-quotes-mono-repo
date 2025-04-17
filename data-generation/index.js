const quotes = require('./quotes.json');
const API_URL = 'http://localhost:8787'; // Replace with your actual API URL
const AUTH_TOKEN = '<AUTH_TOKEN>'; // Replace with your actual auth token

async function createCategories() {
	// Extract unique categories
	const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];

	console.log(`Found ${uniqueCategories.length} unique categories`);

	// Create each category
	for (const category of uniqueCategories) {
		try {
			const response = await fetch(`${API_URL}/categories`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${AUTH_TOKEN}`
				},
				body: JSON.stringify({ name: category }),
			});

			if (!response.ok) {
				console.error(`Failed to create category ${category}`);
				continue;
			}

			console.log(`Created category: ${category}`);
		} catch (error) {
			console.error(`Error creating category ${category}:`, error);
		}
	}
}

async function createQuotes() {
	console.log(`Creating ${quotes.length} quotes`);

	const allCategoriesResponse = await fetch(`${API_URL}/categories`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${AUTH_TOKEN}`
		}
	});

	const allCategories = await allCategoriesResponse.json();

	for (const quote of quotes) {
		try {
			const response = await fetch(`${API_URL}/quotes`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${AUTH_TOKEN}`
				},
				body: JSON.stringify({
					quote: quote.quote,
					author: quote.author,
					categoryId: allCategories.find(cat => cat.name === quote.category)?.id,
				}),
			});

			if (!response.ok) {
				console.error(`Failed to create quote: ${quote.quote.substring(0, 30)}...`);
				continue;
			}

			console.log(`Created quote: ${quote.quote.substring(0, 30)}...`);
		} catch (error) {
			console.error(`Error creating quote:`, error);
		}
	}
}

async function main() {
	console.log('Starting data import...');
	await createCategories();
	await createQuotes();
	console.log('Data import completed');
}

main().catch(console.error);