import type { Env } from "@/index"; // Import Env from index.ts
import {
  createQuote,
  deleteQuote,
  getAllQuotes,
  getQuoteById,
  updateQuote,
} from "@/services/quote.service";
import { getQuoteOfTheDayOrRandom } from "@/services/random-quotes.service";
import {
  DEFAULT_LANG,
  getSupportedLanguages,
} from "@/services/translate.service";
import { DEFAULT_CORS_HEADERS } from "@/utils/constants";

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
  env: Env, // Changed db: D1Database to env: Env
): Promise<Response> => {
  try {
    const userIp = request.headers.get("CF-Connecting-IP") || "unknown"; // Get user IP
    const url = new URL(request.url);
    const categoryIdStr = url.searchParams.get("categoryId");
    let categoryId: number | undefined = undefined;

    if (categoryIdStr && !Number.isNaN(Number(categoryIdStr))) {
      categoryId = Number(categoryIdStr);
    }

    // Validate language
    const requestedLang = url.searchParams.get("lang");
    let finalLang: string = DEFAULT_LANG;
    if (requestedLang && getSupportedLanguages().includes(requestedLang)) {
      finalLang = requestedLang;
    }

    // Replace getRandomQuote with getQuoteOfTheDayOrRandom
    const quote = await getQuoteOfTheDayOrRandom(
      env.DB,
      env.QUOTES_KV,
      userIp,
      {
        categoryId,
        lang: finalLang,
      },
    );

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
