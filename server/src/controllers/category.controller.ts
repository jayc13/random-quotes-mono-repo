import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "@/services/category.service";
import { DEFAULT_CORS_HEADERS } from "@/utils/constants";
import { categoryInputValidator } from "@/validators/category.validator";

export const getAllCategoriesHandler = async (db: D1Database) => {
  const categories = await getAllCategories(db);
  return Response.json(categories, {
    headers: {
      ...DEFAULT_CORS_HEADERS,
      "Content-Range": `categories 0-${categories.length}/${categories.length}`,
      "X-Total-Count": `${categories.length}`,
    },
  });
};

export const createCategoryHandler = async (
  db: D1Database,
  category: { name: string },
) => {
  if (!categoryInputValidator(category)) {
    return Response.json(
      {
        error: "Invalid request body: 'name' must be valid.",
      },
      {
        status: 400,
        headers: DEFAULT_CORS_HEADERS,
      },
    );
  }
  const newCategory = await createCategory(db, category);
  return Response.json(newCategory, {
    status: 201,
    headers: DEFAULT_CORS_HEADERS,
  });
};

export const getCategoryByIdHandler = async (db: D1Database, id: number) => {
  const category = await getCategoryById(db, id);
  if (!category) {
    return new Response("Category not found", {
      status: 404,
      headers: DEFAULT_CORS_HEADERS,
    });
  }
  return Response.json(category, {
    headers: DEFAULT_CORS_HEADERS,
  });
};

export const updateCategoryHandler = async (
  db: D1Database,
  id: number,
  category: { name: string },
) => {
  if (!categoryInputValidator(category)) {
    return Response.json(
      {
        error: "Invalid request body: 'name' must be valid.",
      },
      {
        status: 400,
        headers: DEFAULT_CORS_HEADERS,
      },
    );
  }
  const updatedCategory = await updateCategory(db, id, category);
  if (!updatedCategory) {
    return new Response("Category not found", {
      status: 404,
      headers: DEFAULT_CORS_HEADERS,
    });
  }
  return Response.json(updatedCategory, {
    headers: DEFAULT_CORS_HEADERS,
  });
};

export const deleteCategoryHandler = async (db: D1Database, id: number) => {
  await deleteCategory(db, id);
  return new Response(null, {
    status: 204,
    headers: DEFAULT_CORS_HEADERS,
  });
};
