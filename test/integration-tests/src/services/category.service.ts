interface ApiOptions {
  authToken: string;
}

interface CreateCategoryOptions {
  categoryName: string;
}

export const createCategory = async (categoryOptions: CreateCategoryOptions, apiOptions: ApiOptions) => {
  const {categoryName} = categoryOptions;
  const {authToken} = apiOptions;
  const response = await fetch('http://localhost:8787/categories', {
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