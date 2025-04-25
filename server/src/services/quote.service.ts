import { DEFAULT_LANG, translateText } from "@/services/translate.service";
import type {
  GetAllQuotesOptions,
  GetRandomQuoteOptions,
  Quote,
  QuoteInput,
} from "@/types/quote.types";
import type { KVNamespace } from "@cloudflare/workers-types";
import { D1QB } from "workers-qb";

export const getAllQuotes = async (
  db: D1Database,
  options?: GetAllQuotesOptions,
) => {
  const qb = new D1QB(db);
  const { pagination = { limit: 10, offset: 0 }, filter = {} } = options || {};

  const { limit, offset } = pagination;
  const { categoryId } = filter;

  let where = undefined;

  if (categoryId) {
    where = {
      conditions: "QuoteCategoryId = ?1",
      params: [categoryId],
    };
  }

  const query = qb.fetchAll({
    tableName: "Quotes",
    fields: "*",
    where,
    limit,
    offset,
  });

  const count = await query.count();
  const { results } = await query.execute();

  return {
    quotes:
      results?.map((r) => ({
        id: r.QuoteId as number,
        quote: r.QuoteText as string,
        author: r.QuoteAuthor as string,
        categoryId: r.QuoteCategoryId as number,
      })) ?? [],
    meta: {
      count: results?.length ?? 0,
      total: count.results?.total ?? 0,
    },
  };
};

export const getQuoteById = async (
  db: D1Database,
  id: number,
): Promise<Quote | null> => {
  const { results } = await db
    .prepare("SELECT * FROM Quotes WHERE QuoteId = ?")
    .bind(id)
    .all();

  if (results.length === 0) {
    return null;
  }

  const r = results[0];
  return {
    id: r.QuoteId as number,
    quote: r.QuoteText as string,
    author: r.QuoteAuthor as string,
    categoryId: r.QuoteCategoryId as number,
  };
};

export const validateQuoteInput = (input: QuoteInput): boolean => {
  return !(
    !input ||
    !input.quote ||
    input.quote.trim().length === 0 ||
    input.quote.length > 250 ||
    !input.author ||
    input.author.trim().length === 0 ||
    input.author.length > 100 ||
    !input.categoryId ||
    typeof input.categoryId !== "number"
  );
};

export const createQuote = async (
  db: D1Database,
  input: QuoteInput,
): Promise<Quote> => {
  const { quote, author, categoryId } = input;

  if (!validateQuoteInput(input)) {
    throw new Error("Invalid quote input");
  }

  const result = await db
    .prepare(
      "INSERT INTO Quotes (QuoteText, QuoteAuthor, QuoteCategoryId) VALUES (?, ?, ?)",
    )
    .bind(quote, author, categoryId)
    .run();

  const id: number = result.meta.last_row_id as number;

  return {
    id,
    quote,
    author,
    categoryId,
  };
};

export const updateQuote = async (
  db: D1Database,
  id: number,
  input: QuoteInput,
): Promise<Quote | null> => {
  const { quote, author, categoryId } = input;

  if (!validateQuoteInput(input)) {
    throw new Error("Invalid quote input");
  }

  await db
    .prepare(
      "UPDATE Quotes SET QuoteText = ?, QuoteAuthor = ?, QuoteCategoryId = ? WHERE QuoteId = ?",
    )
    .bind(quote, author, categoryId, id)
    .run();

  return getQuoteById(db, id);
};

export const deleteQuote = async (
  db: D1Database,
  id: number,
): Promise<boolean> => {
  const result = await db
    .prepare("DELETE FROM Quotes WHERE QuoteId = ?")
    .bind(id)
    .run();

  return result.success;
};

export const getRandomQuote = async (
  db: D1Database,
  options?: GetRandomQuoteOptions,
): Promise<Quote | null> => {
  const qb = new D1QB(db);
  const { categoryId, lang = DEFAULT_LANG } = options || {};

  let where = undefined;

  if (categoryId) {
    where = {
      conditions: "QuoteCategoryId = ?1",
      params: [categoryId],
    };
  }

  const query = qb.fetchAll({
    tableName: "Quotes",
    fields: "*",
    where,
    orderBy: "RANDOM()",
    limit: 1,
  });

  const { results } = await query.execute();

  if (!results || results.length === 0) {
    return null;
  }

  const selectedQuote = {
    id: results[0].QuoteId as number,
    quote: results[0].QuoteText as string,
    author: results[0].QuoteAuthor as string,
    categoryId: results[0].QuoteCategoryId as number,
  };

  if (lang !== DEFAULT_LANG) {
    try {
      selectedQuote.quote = await translateText({
        text: selectedQuote.quote,
        sourceLang: DEFAULT_LANG,
        targetLang: lang,
      });
    } catch (error) {
      console.error(`Translation failed for quote ${selectedQuote.id}:`, error);
    }
  }

  return selectedQuote;
};

export const getQuoteOfTheDayOrRandom = async (
  db: D1Database,
  kv: KVNamespace,
  userIp: string,
  options?: GetRandomQuoteOptions,
): Promise<Quote | null> => {
  const { lang = DEFAULT_LANG, categoryId } = options || {};
  const date = new Date().toISOString().split("T")[0]; // UTC date YYYY-MM-DD
  const userKey = `qotd_requested_${userIp}_${date}`;
  const dailyKey = `qotd_${date}${categoryId ? `_cat${categoryId}` : ""}`; // Add categoryId to daily key if present

  try {
    const userHasRequested = await kv.get(userKey);

    if (userHasRequested) {
      // User already got the QotD today, return a truly random one
      console.log(`User ${userIp} already requested QotD for ${date}. Fetching random.`);
      return await getRandomQuote(db, options);
    }

    // User hasn't requested QotD today, try fetching the cached daily quote
    let dailyQuote: Quote | null = null;
    try {
      const dailyQuoteJson = await kv.get(dailyKey);
      if (dailyQuoteJson) {
        console.log(`Found cached QotD for ${date} (key: ${dailyKey}).`);
        dailyQuote = JSON.parse(dailyQuoteJson) as Quote;
      }
    } catch (e) {
      console.error(`Error fetching/parsing QotD from KV (key: ${dailyKey}):`, e);
      // Continue to fetch a new one if parsing fails
    }

    if (dailyQuote) {
      // Found the cached QotD
      try {
        await kv.put(userKey, "1", { expirationTtl: 86400 }); // Mark user as requested for today (24 hours)
        console.log(`Marked user ${userIp} as requested for ${date}.`);
      } catch (e) {
        console.error(`Error setting user flag in KV (key: ${userKey}):`, e);
        // Proceed even if user flag fails
      }

      // Translate if needed
      if (lang !== DEFAULT_LANG && dailyQuote.quote) {
        try {
          console.log(`Translating cached QotD ${dailyQuote.id} to ${lang}.`);
          dailyQuote.quote = await translateText({
            text: dailyQuote.quote,
            sourceLang: DEFAULT_LANG,
            targetLang: lang,
          });
        } catch (error) {
          console.error(`Translation failed for cached QotD ${dailyQuote.id}:`, error);
          // Return default language version if translation fails
        }
      }
      return dailyQuote;
    } else {
      // No cached QotD found, fetch a new one
      console.log(`No cached QotD for ${date} (key: ${dailyKey}). Fetching new one.`);
      const newQuoteOfTheDay = await getRandomQuote(db, { categoryId }); // Fetch in default language

      if (newQuoteOfTheDay) {
        // Store the new QotD in KV
        try {
          await kv.put(dailyKey, JSON.stringify(newQuoteOfTheDay), {
            expirationTtl: 86400, // Cache for 24 hours
          });
          console.log(`Stored new QotD in KV (key: ${dailyKey}).`);
        } catch (e) {
          console.error(`Error storing new QotD in KV (key: ${dailyKey}):`, e);
          // Proceed even if storing fails
        }

        // Store the user flag
        try {
          await kv.put(userKey, "1", { expirationTtl: 86400 });
          console.log(`Marked user ${userIp} as requested for ${date}.`);
        } catch (e) {
          console.error(`Error setting user flag in KV (key: ${userKey}):`, e);
          // Proceed even if user flag fails
        }

        // Translate if needed
        if (lang !== DEFAULT_LANG && newQuoteOfTheDay.quote) {
          try {
            console.log(`Translating new QotD ${newQuoteOfTheDay.id} to ${lang}.`);
            newQuoteOfTheDay.quote = await translateText({
              text: newQuoteOfTheDay.quote,
              sourceLang: DEFAULT_LANG,
              targetLang: lang,
            });
          } catch (error) {
            console.error(`Translation failed for new QotD ${newQuoteOfTheDay.id}:`, error);
            // Return default language version if translation fails
          }
        }
        return newQuoteOfTheDay;
      } else {
        // No quote found at all
        console.log("Could not fetch any quote.");
        return null;
      }
    }
  } catch (error) {
    console.error("Error in getQuoteOfTheDayOrRandom:", error);
    // Fallback to truly random quote in case of any unexpected error during the process
    console.log("Falling back to getRandomQuote due to error.");
    return await getRandomQuote(db, options);
  }
};
