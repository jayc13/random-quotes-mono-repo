DROP TABLE IF EXISTS Categories;
CREATE TABLE IF NOT EXISTS Categories (CategoryId INTEGER PRIMARY KEY, CategoryName TEXT);
INSERT
	INTO Categories (CategoryName)
	VALUES
		('Motivation'),
		('Wisdom'),
		('Love');
