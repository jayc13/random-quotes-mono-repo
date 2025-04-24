import type React from "react";
import { useState, useEffect } from "react";

// Define the Category type
type Category = {
	id: string;
	name: string;
};

// Define the component props interface
interface CategoryFilterProps {
	currentCategoryId: string | null;
	onCategoryChange: (categoryId: string | null) => void;
	categories: Category[];
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
	currentCategoryId,
	onCategoryChange,
	categories = [],
}) => {

	const handleCategoryChange = (
		event: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const selectedId = event.target.value;
		onCategoryChange(selectedId === "all" ? null : selectedId);
	};

	return (
		<div className="category-filter">
			<label htmlFor="category-select">Category:</label>
			<select
				id="category-select"
				value={currentCategoryId === null ? "all" : currentCategoryId}
				onChange={handleCategoryChange}
			>
				<option value="all">All Categories</option>
				{categories.map((category) => (
					<option key={category.id} value={category.id}>
						{category.name}
					</option>
				))}
			</select>
		</div>
	);
};

export default CategoryFilter;
