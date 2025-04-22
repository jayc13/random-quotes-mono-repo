// server/src/controllers/quote-svg.controller.ts

import { D1Database } from '@cloudflare/workers-types';
import { getRandomQuote } from '@/services/quote.service';
import { generateQuoteSvg } from '@/services/quote-svg.service';
// Import language constants and functions
import { DEFAULT_LANG, getSupportedLanguages } from '@/services/translate.service';
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';
import { Quote } from '@/types/quote.types';

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
export async function getRandomQuoteSvgHandler(request: Request, db: D1Database): Promise<Response> {
  const url = new URL(request.url);
  const params = url.searchParams;

  // --- Parameter Parsing and Validation ---

  // Theme (default: light)
  const themeParam = params.get('theme');
  const theme = (themeParam === 'dark' || themeParam === 'light') ? themeParam : 'light';

  // Dimensions (default: 800x200)
  let width = 800;
  let height = 200;
  const widthParam = params.get('width');
  const heightParam = params.get('height');

  if (widthParam) {
    const parsedWidth = parseInt(widthParam, 10);
    if (!isNaN(parsedWidth) && parsedWidth > 0) {
      width = parsedWidth;
    } else {
      console.warn(`Invalid width parameter received: ${widthParam}. Using default ${width}.`);
    }
  }
  if (heightParam) {
    const parsedHeight = parseInt(heightParam, 10);
    if (!isNaN(parsedHeight) && parsedHeight > 0) {
      height = parsedHeight;
    } else {
       console.warn(`Invalid height parameter received: ${heightParam}. Using default ${height}.`);
    }
  }

  // Language (default: DEFAULT_LANG)
  const langParam = params.get('lang');
  const supportedLanguages = getSupportedLanguages();
  const lang = langParam && supportedLanguages.includes(langParam) ? langParam : DEFAULT_LANG;

  // Category ID (optional)
  const categoryIdParam = params.get('categoryId');
  let categoryId: number | undefined = undefined;
  if (categoryIdParam) {
    const parsedId = parseInt(categoryIdParam, 10);
    if (!isNaN(parsedId)) {
      categoryId = parsedId;
    } else {
       console.warn(`Invalid categoryId parameter received: ${categoryIdParam}. Ignoring.`);
    }
  }

  // --- Service Calls ---

  try {
    // Options for fetching the quote (includes lang and optional categoryId)
    const randomOptions: { lang: string; categoryId?: number } = {
        lang,
        ...(categoryId !== undefined && { categoryId }), // Conditionally add categoryId
    };
    const quote: Quote | null = await getRandomQuote(db, randomOptions);

    if (!quote) {
      const message = categoryId !== undefined
        ? `No quotes found for category ID ${categoryId}.`
        ? `No quotes found for category ID ${categoryId} in language ${lang}.`
        : `No quotes found in language ${lang}.`;
      return new Response(message, {
        status: 404,
        headers: { ...DEFAULT_CORS_HEADERS },
      });
    }

    // Options for generating the SVG (includes theme and dimensions)
    const svgOptions = { theme, width, height };
    const svgString = generateQuoteSvg(quote, svgOptions);

    const headers = {
      ...DEFAULT_CORS_HEADERS, // Keep CORS headers
      'Content-Type': 'image/svg+xml',
      // Consider adding 'Cache-Control: no-cache' for random quotes
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
    };

    return new Response(svgString, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error('Error in getRandomQuoteSvgHandler:', error);
    return new Response('Internal Server Error', {
      status: 500,
      headers: { ...DEFAULT_CORS_HEADERS },
    });
  }
}