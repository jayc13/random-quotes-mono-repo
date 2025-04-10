import {
	createCategory,
	deleteCategory,
	getAllCategories,
	getCategoryById,
	updateCategory
} from "../services/category.service";

export const getAllCategoriesHandler = async (db: D1Database) => {
	const categories = await getAllCategories(db);
	return Response.json(categories);
}

export const createCategoryHandler = async (db: D1Database, category: { name: string }) => {
	const newCategory = await createCategory(db, category);
	return Response.json(newCategory, { status: 201 });
};

export const getCategoryByIdHandler = async (db: D1Database, id: number) => {
	const category = await getCategoryById(db, id);
	if (!category) {
		return new Response('Category not found', { status: 404 });
	}
	return Response.json(category);
};

export const updateCategoryHandler = async (db: D1Database, id: number, category: { name: string }) => {
	const updatedCategory = await updateCategory(db, id, category);
	if (!updatedCategory) {
		return new Response('Category not found', { status: 404 });
	}
	return Response.json(updatedCategory);
}

export const deleteCategoryHandler = async (db: D1Database, id: number) => {
	await deleteCategory(db, id);
	return new Response(null, { status: 204 });
};
