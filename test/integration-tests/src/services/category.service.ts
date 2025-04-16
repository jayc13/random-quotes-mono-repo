import {API_BASE_URL} from '../utils/config.ts';

interface ApiOptions {
  authToken: string;
}

interface CreateCategoryOptions {
  categoryName: string;
}

export const createCategory = async (categoryOptions: CreateCategoryOptions, apiOptions: ApiOptions) => {
  const {categoryName} = categoryOptions;
  const {authToken} = apiOptions;
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken,
    },
    body: JSON.stringify({name: categoryName}),
  });

  if (!response.ok) {
    throw new Error(`Error creating category: ${response.statusText}`);
  }

  return response.json();
}

interface DeleteCategoryOptions {
  categoryId: number;
}

export const deleteCategory = async (categoryOptions: DeleteCategoryOptions, apiOptions: ApiOptions) => {
  const {categoryId} = categoryOptions;
  const {authToken} = apiOptions;
  const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': authToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Error deleting category: ${response.statusText}`);
  }
}