import React, { useState, useEffect } from 'react';

// Define the Category type
type Category = {
  id: string;
  name: string;
};

// Define the component props interface
interface CategoryFilterProps {
  currentCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ currentCategoryId, onCategoryChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    onCategoryChange(selectedId === 'all' ? null : selectedId);
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>Error loading categories: {error}</div>;
  }

  return (
    <div className="category-filter">
      <label htmlFor="category-select">Category:</label>
      <select
        id="category-select"
        value={currentCategoryId === null ? 'all' : currentCategoryId}
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
