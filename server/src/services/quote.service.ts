import { DEFAULT_LANG, translateText } from "@/services/translate.service";
import type {
  GetAllQuotesOptions,
  GetRandomQuoteOptions,
  Quote,
  QuoteInput,
} from "@/types/quote.types";
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
  options?: {
    lang?: string;
  },
): Promise<Quote | null> => {
  const { lang = DEFAULT_LANG } = options || {};

  const { results } = await db
    .prepare("SELECT * FROM Quotes WHERE QuoteId = ?")
    .bind(id)
    .all();

  if (results.length === 0) {
    return null;
  }

  const r = results[0];

  const selectedQuote = {
    id: r.QuoteId as number,
    quote: r.QuoteText as string,
    author: r.QuoteAuthor as string,
    categoryId: r.QuoteCategoryId as number,
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
  const { categoryId } = options || {};
  const date = new Date().toISOString().split("T")[0]; // UTC date YYYY-MM-DD
  const userKey = `qotd_requested_${userIp}_${date}`;

  if (categoryId) {
    return getRandomQuote(db, options);
  }
  const userHasRequested: string | null = await kv.get(userKey);
  if (userHasRequested) return getRandomQuote(db, options);

  const quoteOfTheDay = await getQuoteOfTheDay(db, kv, options);

  await kv
    .put(userKey, "1", { expirationTtl: 86400 })
    .catch((e) =>
      console.error(`Error setting user flag in KV (key: ${userKey}):`, e),
    );

  if (!quoteOfTheDay) {
    console.log("No QotD found. Falling back to random quote.");
    return getRandomQuote(db, options);
  }
  return quoteOfTheDay;
};

export const getQuoteOfTheDay = async (
  db: D1Database,
  kv: KVNamespace,
  options?: GetRandomQuoteOptions,
): Promise<Quote | null> => {
  const { lang = DEFAULT_LANG } = options || {};
  const date = new Date().toISOString().split("T")[0]; // UTC date YYYY-MM-DD
  const dailyKey = `qotd_${date}`; // Cache key for daily quote
  const dailyQuoteId: string | null = await kv.get(dailyKey);

  if (dailyQuoteId) {
    return await getQuoteById(db, Number.parseInt(dailyQuoteId), { lang });
  }

  console.log(
    `No cached QotD for ${date} (key: ${dailyKey}). Fetching new one.`,
  );

  const newQuoteOfTheDay = await getRandomQuote(db, options);

  if (newQuoteOfTheDay) {
    await kv
      .put(dailyKey, newQuoteOfTheDay.id.toString(), { expirationTtl: 86400 })
      .catch((e) =>
        console.error(`Error caching QotD in KV (key: ${dailyKey}):`, e),
      );
    return newQuoteOfTheDay;
  }
  console.log("Could not fetch any quote.");
  return null;
};
