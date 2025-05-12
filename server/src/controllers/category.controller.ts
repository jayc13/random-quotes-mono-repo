import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "@/services/category.service";
import { categoryInputValidator } from "@/validators/category.validator";
import type { IRequest } from "itty-router";

export const getAllCategoriesHandler = async (request: IRequest, env: Env) => {
  const db = env.DB as D1Database;
  const categories = await getAllCategories(db);
  return Response.json(categories, {
    headers: {
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
      },
    );
  }
  const newCategory = await createCategory(db, category);
  return Response.json(newCategory, {
    status: 201,
  });
};

export const getCategoryByIdHandler = async (db: D1Database, id: number) => {
  const category = await getCategoryById(db, id);
  if (!category) {
    return new Response("Category not found", {
      status: 404,
    });
  }
  return Response.json(category);
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
      },
    );
  }
  const updatedCategory = await updateCategory(db, id, category);
  if (!updatedCategory) {
    return new Response("Category not found", {
      status: 404,
    });
  }
  return Response.json(updatedCategory);
};

export const deleteCategoryHandler = async (db: D1Database, id: number) => {
  await deleteCategory(db, id);
  return new Response(null, {
    status: 204,
  });
};
