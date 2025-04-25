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
	const handleCategoryChange = (selectedId: string) => {
		onCategoryChange(selectedId === "all" ? null : selectedId);
	};

	console.log({currentCategoryId})

	return (
		<div
			className="flex flex-col items-center relative"
			data-testid="category-filter"
		>
			<div className="dropdown dropdown-end">
				<button
					className="btn m-1 btn-ghost bg-transparent"
					type="button"
					data-testid="category-selector-button"
				>
					{categories.find(
						(category) => category.id.toString() === currentCategoryId,
					)?.name ?? "Random"}
				</button>
				<ul className="dropdown-content menu bg-base-100 rounded-box z-1 p-0 shadow-sm">
					<li
						key="all"
						value="all"
						className="pointer cursor-pointer"
						onKeyDown={() => handleCategoryChange("all")}
						onClick={() => handleCategoryChange("all")}
					>
						<button
							type="button"
							className="btn btn-ghost text-left bg-transparent"
							data-testid="category-selector-all"
						>
							{" "}
							Random{" "}
						</button>
					</li>
					{categories.map((category) => (
						<li
							key={category.id}
							value={category.id}
							className="pointer cursor-pointer"
							onKeyDown={() => handleCategoryChange(category.id)}
							onClick={() => handleCategoryChange(category.id)}
						>
							<button
								type="button"
								className="btn btn-ghost text-left bg-transparent"
								data-testid={`category-selector-${category.id}`}
							>
								{category.name}
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default CategoryFilter;
