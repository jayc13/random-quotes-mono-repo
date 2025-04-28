import type {GetRandomQuoteOptions, Quote} from "@/types/quote.types";
import {D1QB} from "workers-qb";
import {DEFAULT_LANG, translateText} from "@/services/translate.service";
import {getQuoteById} from "@/services/quote.service";

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
