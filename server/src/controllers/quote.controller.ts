import { DEFAULT_CORS_HEADERS } from "../index";
import {
  createQuote,
  deleteQuote,
  getAllQuotes,
  getQuoteById,
  getRandomQuote,
  updateQuote,
} from "../services/quote.service";
import { DEFAULT_LANG, getSupportedLanguages } from "../services/translate.service"; // <-- Import getSupportedLanguages

export const getAllQuotesHandler = async (request: Request, db: D1Database) => {
  const url = new URL(request.url);
  const start = Number.parseInt(url.searchParams.get("_start") || "0", 10);
  const end = Number.parseInt(url.searchParams.get("_end") || "10", 10);
  const limit = end - start;
  const offset = start;
  const categoryId = url.searchParams.get("categoryId") || "0";
  const options = {
    pagination: {
      limit,
      offset,
    },
    filter: {
      categoryId: Number.parseInt(categoryId, 10),
    },
  };
  const {
    quotes,
    meta: { count, total },
  } = await getAllQuotes(db, options);
  return Response.json(quotes, {
    headers: {
      ...DEFAULT_CORS_HEADERS,
      "Content-Range": `quotes ${start}-${end}/${count}`,
      "X-Total-Count": `${total}`,
    },
  });
};

export const getRandomQuoteHandler = async (
  request: Request,
  db: D1Database,
): Promise<Response> => {
  try {
    const url = new URL(request.url);
    const categoryIdStr = url.searchParams.get("categoryId");
    let categoryId: number | undefined = undefined;

    if (categoryIdStr) {
      const parsedId = Number.parseInt(categoryIdStr, 10);
      if (!isNaN(parsedId)) {
        categoryId = parsedId;
      }
    }

    // Validate language
    const requestedLang = url.searchParams.get("lang");
    let finalLang = DEFAULT_LANG; // Default to DEFAULT_LANG

    if (requestedLang) {
      // Check if the requested language is supported
      if (getSupportedLanguages().includes(requestedLang)) {
        finalLang = requestedLang; // Use the supported requested language
      }
      // If requestedLang exists but is not supported, finalLang remains DEFAULT_LANG
    }

    const quote = await getRandomQuote(db, { categoryId, lang: finalLang }); // <-- Use finalLang

    if (!quote) {
      return Response.json(
        { error: "No quote found matching the criteria" },
        {
          status: 404,
          headers: DEFAULT_CORS_HEADERS,
        },
      );
    }

    return Response.json(quote, {
      headers: DEFAULT_CORS_HEADERS,
    });
  } catch (error) {
    console.error("Error in getRandomQuoteHandler:", error);
    return Response.json(
      { error: "An internal error occurred" },
      {
        status: 500,
        headers: DEFAULT_CORS_HEADERS,
      },
    );
  }
};

export const getQuoteByIdHandler = async (db: D1Database, id: number) => {
  const quote = await getQuoteById(db, id);
  if (!quote) {
    return new Response("Quote not found", {
      status: 404,
      headers: DEFAULT_CORS_HEADERS,
    });
  }
  return Response.json(quote, {
    headers: DEFAULT_CORS_HEADERS,
  });
};

export const createQuoteHandler = async (
  db: D1Database,
  quote: { quote: string; author: string; categoryId: number },
) => {
  const newQuote = await createQuote(db, quote);
  return Response.json(newQuote, {
    status: 201,
    headers: DEFAULT_CORS_HEADERS,
  });
};

export const updateQuoteHandler = async (
  db: D1Database,
  id: number,
  quote: { quote: string; author: string; categoryId: number },
) => {
  const updatedQuote = await updateQuote(db, id, quote);
  if (!updatedQuote) {
    return new Response("Quote not found", {
      status: 404,
      headers: DEFAULT_CORS_HEADERS,
    });
  }
  return Response.json(updatedQuote, {
    headers: DEFAULT_CORS_HEADERS,
  });
};

export const deleteQuoteHandler = async (db: D1Database, id: number) => {
  const success = await deleteQuote(db, id);
  if (!success) {
    return new Response("Quote not found", {
      status: 404,
      headers: DEFAULT_CORS_HEADERS,
    });
  }
  return new Response(null, {
    status: 204,
    headers: DEFAULT_CORS_HEADERS,
  });
};
