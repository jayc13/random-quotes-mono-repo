-- Migration number: 0002    2025-04-11T10:00:00.000Z
CREATE TABLE IF NOT EXISTS Quotes
(
	QuoteId
	INTEGER
	PRIMARY
	KEY,
	QuoteText
	TEXT
	NOT
	NULL,
	QuoteAuthor
	TEXT
	NOT
	NULL,
	QuoteCategoryId
	INTEGER
	NOT
	NULL,
	FOREIGN
	KEY
(
	QuoteCategoryId
) REFERENCES Categories
(
	CategoryId
) ON DELETE CASCADE
	);
