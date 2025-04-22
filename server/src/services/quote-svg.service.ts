// server/src/services/quote-svg.service.ts

import { Quote } from '@/types/quote.types';

/**
 * Generates an SVG image string for a given quote and theme.
 *
 * @param quote - The quote object containing the quote text and author.
 * @param options - An object containing theme ('light' or 'dark'), width, and height.
 * @returns An SVG string representing the quote.
 */
export function generateQuoteSvg(
  quote: Quote,
  options: { theme: 'light' | 'dark'; width: number; height: number }
): string {
  const { theme, width, height } = options;

  // Theme-based colors
  const bgColor = theme === 'dark' ? '#121212' : '#f0f0f0'; // Use theme from options
  const textColor = theme === 'dark' ? '#f0f0f0' : '#121212';
  const authorColor = theme === 'dark' ? '#a0a0a0' : '#555555'; // Slightly different color for author

  // Basic SVG structure
  let svgString = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: ${bgColor}; font-family: sans-serif;">`;

  // Add background rectangle (optional, could use style on svg tag)
  // svgString += `<rect width="100%" height="100%" fill="${bgColor}" />`; // Optional background rect

  // Add quote text - Removed truncation
  // NOTE: Long text might overflow without wrapping. Consider <tspan> or foreignObject for complex wrapping.
  svgString += `
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="${textColor}">
      "${quote.quote}"
    </text>
  `;

  // Add author text
  svgString += `
    <text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle" font-size="16" fill="${authorColor}">
      - ${quote.author}
    </text>
  `;

  svgString += `</svg>`;

  return svgString;
}
