import { generateQuoteSvg } from "@/services/quote-svg.service";
import { getRandomQuote } from "@/services/quote.service";
import {
  DEFAULT_LANG,
  getSupportedLanguages,
} from "@/services/translate.service";
import type { Quote } from "@/types/quote.types";
import { DEFAULT_CORS_HEADERS } from "@/utils/constants";

/**
 * Handles requests for generating quote SVG images.
 *
 * Parses the request URL for quote ID and theme, fetches the quote,
 * generates the SVG, and returns it as a Response.
 *
 * @param request - The incoming Request object.
/**
 * Handles requests for generating a random quote SVG image.
 *
 * Parses the request URL for theme and optional categoryId, fetches a random quote,
 * generates the SVG, and returns it as a Response.
 *
 * @param request - The incoming Request object.
 * @param db - The D1 Database instance.
 * @returns A Promise resolving to a Response object.
 */
export async function getRandomQuoteSvgHandler(
  request: Request,
  db: D1Database,
): Promise<Response> {
  const url = new URL(request.url);
  const params = url.searchParams;

  // --- Parameter Parsing and Validation ---

  // Theme (default: light)
  const themeParam = params.get("theme");
  const theme: "dark" | "light" = themeParam === "dark" ? "dark" : "light";

  // Dimensions (default: 800x200)
  let width = 800;
  let height = 200;
  const widthParam = params.get("width");
  const heightParam = params.get("height");

  if (widthParam) {
    const parsedWidth = Number.parseInt(widthParam, 10);
    if (!Number.isNaN(parsedWidth) && parsedWidth > 0) {
      width = parsedWidth;
    }
  }
  if (heightParam) {
    const parsedHeight = Number.parseInt(heightParam, 10);
    if (!Number.isNaN(parsedHeight) && parsedHeight > 0) {
      height = parsedHeight;
    }
  }

  // Language (default: DEFAULT_LANG)
  const langParam = params.get("lang") ?? DEFAULT_LANG;
  const supportedLanguages = getSupportedLanguages();
  const lang = supportedLanguages.includes(langParam)
    ? langParam
    : DEFAULT_LANG;

  // Category ID (optional)
  const categoryIdParam = params.get("categoryId");
  let categoryId: number | undefined = undefined;
  if (categoryIdParam) {
    const parsedId = Number.parseInt(categoryIdParam, 10);
    if (!Number.isNaN(parsedId)) {
      categoryId = parsedId;
    }
  }

  // --- Service Calls ---

  try {
    // Options for fetching the quote (includes lang and optional categoryId)
    const randomOptions: { lang: string; categoryId?: number } = {
      lang,
      categoryId,
    };
    const quote: Quote | null = await getRandomQuote(db, randomOptions);

    if (!quote) {
      return new Response("No quote found matching the criteria", {
        status: 404,
        headers: { ...DEFAULT_CORS_HEADERS },
      });
    }

    // Options for generating the SVG (includes theme and dimensions)
    const svgOptions = { theme, width, height };
    const svgString = generateQuoteSvg(quote, svgOptions);

    const headers = {
      ...DEFAULT_CORS_HEADERS, // Keep CORS headers
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    };

    return new Response(svgString, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Error in getRandomQuoteSvgHandler:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { ...DEFAULT_CORS_HEADERS },
    });
  }
}
