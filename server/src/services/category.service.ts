export interface Category {
  id: number;
  name: string;
}

export interface CategoryInput {
  name: string;
}

export const getAllCategories = async (db: D1Database): Promise<Category[]> => {
  const { results } = await db.prepare("SELECT * FROM Categories").all();

  return results.map((r) => ({
    id: r.CategoryId as number,
    name: r.CategoryName as string,
  }));
};

export const getCategoryById = async (
  db: D1Database,
  id: number,
): Promise<Category | null> => {
  const { results } = await db
    .prepare("SELECT * FROM Categories WHERE CategoryId = ?")
    .bind(id)
    .all();

  if (results.length === 0) {
    return null;
  }

  const r = results[0];
  return {
    id: r.CategoryId as number,
    name: r.CategoryName as string,
  };
};

export const validateCategoryInput = (input: CategoryInput): boolean => {
  return !(!input || !input.name || input.name.trim().length === 0);
};

export const createCategory = async (
  db: D1Database,
  input: CategoryInput,
): Promise<Category> => {
  const { name } = input;

  if (!validateCategoryInput(input)) {
    throw new Error("Invalid category input");
  }

  const result = await db
    .prepare("INSERT INTO Categories (CategoryName) VALUES (?)")
    .bind(name)
    .run();

  const id: number = result.meta.last_row_id as number;

  return {
    id,
    name,
  };
};

export const updateCategory = async (
  db: D1Database,
  id: number,
  input: CategoryInput,
): Promise<Category | null> => {
  const { name } = input;

  if (!validateCategoryInput(input)) {
    throw new Error("Invalid category input");
  }

  await db
    .prepare("UPDATE Categories SET CategoryName = ? WHERE CategoryId = ?")
    .bind(name, id)
    .run();

  return getCategoryById(db, id);
};

export const deleteCategory = async (
  db: D1Database,
  id: number,
): Promise<boolean> => {
  const result = await db
    .prepare("DELETE FROM Categories WHERE CategoryId = ?")
    .bind(id)
    .run();

  return result.success;
};
