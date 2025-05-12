import {
  createQuote,
  deleteQuote,
  getAllQuotes,
  getQuoteById,
  updateQuote,
} from "@/services/quote.service";
import {
  getQuoteOfTheDay,
  getQuoteOfTheDayOrRandom,
} from "@/services/random-quotes.service";
import {
  DEFAULT_LANG,
  getSupportedLanguages,
} from "@/services/translate.service";
import { quoteInputValidator } from "@/validators/quote.validator";
import { type IRequest, json } from "itty-router";

export const getAllQuotesHandler = async (request: Request, db: D1Database) => {
  const url = new URL(request.url);
  const start = Number.parseInt(url.searchParams.get("_start") || "0", 10);
  const end = Number.parseInt(url.searchParams.get("_end") || "10", 10);
  const limit = end - start;
  const offset = start;
  const categoryIdStr = url.searchParams.get("categoryId");

  // Validate categoryId format if it exists
  if (categoryIdStr && !/^\d+$/.test(categoryIdStr)) {
    return Response.json(
      { error: "Invalid categoryId format" },
      {
        status: 400,
      },
    );
  }

  // Use the validated categoryId or default to 0 if not provided
  const categoryId = categoryIdStr ? Number.parseInt(categoryIdStr, 10) : 0;

  const options = {
    pagination: {
      limit,
      offset,
    },
    filter: {
      categoryId,
    },
  };
  const {
    quotes,
    meta: { count, total },
  } = await getAllQuotes(db, options);

  return json(quotes, {
    headers: {
      "content-range": `quotes ${start}-${end}/${count}`,
      "x-total-count": total,
      "Access-Control-Expose-Headers": "content-range, x-total-count",
    },
  });
};

export const getRandomQuoteHandler = async (
  request: IRequest,
  env: Env,
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
        },
      );
    }

    return Response.json(quote);
  } catch (error) {
    console.error("Error in getRandomQuoteHandler:", error);
    return Response.json(
      { error: "An internal error occurred" },
      {
        status: 500,
      },
    );
  }
};

export const getQuoteByIdHandler = async (db: D1Database, id: number) => {
  const quote = await getQuoteById(db, id);
  if (!quote) {
    return new Response("Quote not found", {
      status: 404,
    });
  }
  return Response.json(quote);
};

export const getQuoteOfTheDayHandler = async (
  request: IRequest,
  env: Env,
): Promise<Response> => {
  try {
    const url = new URL(request.url);
    const requestedLang = url.searchParams.get("lang");
    let finalLang: string = DEFAULT_LANG;

    if (requestedLang && getSupportedLanguages().includes(requestedLang)) {
      finalLang = requestedLang;
    }

    const quote = await getQuoteOfTheDay(env.DB, env.QUOTES_KV, {
      lang: finalLang,
    });

    if (!quote) {
      return Response.json(
        { error: "Could not retrieve the quote of the day" },
        {
          status: 404,
        },
      );
    }

    return Response.json(quote);
  } catch (error) {
    console.error("Error in getQuoteOfTheDayHandler:", error);
    return Response.json(
      { error: "An internal error occurred" },
      {
        status: 500,
      },
    );
  }
};

export const createQuoteHandler = async (
  db: D1Database,
  quote: { quote: string; author: string; categoryId: number },
) => {
  if (!quoteInputValidator(quote)) {
    return Response.json(
      {
        error:
          "Invalid request body: 'quote', 'author', and 'categoryId' are required and must be valid.",
      },
      { status: 400 },
    );
  }

  try {
    const newQuote = await createQuote(db, quote);
    return Response.json(newQuote, {
      status: 201,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in createQuoteHandler:", error);
    // Return a generic 500 error for other types of errors
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const updateQuoteHandler = async (
  db: D1Database,
  id: number,
  quote: { quote: string; author: string; categoryId: number },
) => {
  if (!quoteInputValidator(quote)) {
    return Response.json(
      {
        error:
          "Invalid request body: 'quote', 'author', and 'categoryId' are required and must be valid.",
      },
      { status: 400 },
    );
  }
  try {
    const updatedQuote = await updateQuote(db, id, quote);
    if (!updatedQuote) {
      return new Response("Quote not found", {
        status: 404,
      });
    }
    return Response.json(updatedQuote);
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in updateQuoteHandler:", error);
    // Return a generic 500 error for other types of errors
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const deleteQuoteHandler = async (db: D1Database, id: number) => {
  const success = await deleteQuote(db, id);
  if (!success) {
    return new Response("Quote not found", {
      status: 404,
    });
  }
  return new Response(null, {
    status: 204,
  });
};
