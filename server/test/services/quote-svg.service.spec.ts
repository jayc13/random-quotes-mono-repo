// server/test/services/quote-svg.service.spec.ts

import { describe, it, expect } from 'vitest';
import { generateQuoteSvg } from '@/services/quote-svg.service';
import type { Quote } from '@/types/quote.types';

// Sample data
const sampleQuote: Quote = {
  id: 1,
  quote: 'This is a test quote.',
  author: 'Test Author',
  category_id: 1,
  // Add other fields if necessary based on the actual Quote type
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const longQuote: Quote = {
    id: 2,
    quote: 'This is a very long quote designed to test the truncation logic which should add ellipsis at the end if it exceeds the maximum length defined in the service.',
    author: 'Long Author',
    category_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}

describe('generateQuoteSvg Service', () => {
  const defaultOptions = { theme: 'light' as const, width: 800, height: 200 };
  const darkOptions = { theme: 'dark' as const, width: 800, height: 200 };
  const customDimOptions = { theme: 'dark' as const, width: 500, height: 150 };

  it('should generate SVG with light theme and default dimensions correctly', () => {
    const svg = generateQuoteSvg(sampleQuote, defaultOptions);

    // Basic structure checks
    expect(svg).toContain('<svg width="800" height="200"'); // Check dimensions attribute
    expect(svg).toContain('viewBox="0 0 800 200"'); // Check viewBox attribute
    expect(svg).toContain('</svg>');

    // Theme checks
    expect(svg).toContain('style="background-color: #f0f0f0;'); // Check light background
    expect(svg).toContain('fill="#121212"'); // Check light theme quote text color
    expect(svg).toContain('fill="#555555"'); // Check light theme author color

    // Content checks
    expect(svg).toContain(`"${sampleQuote.quote}"`); // Check for quote text
    expect(svg).toContain(`- ${sampleQuote.author}<`); // Check for author text (ensure '<' is part of check if needed)
  });

  it('should generate SVG with dark theme and default dimensions correctly', () => {
    const svg = generateQuoteSvg(sampleQuote, darkOptions);

     // Basic structure checks
     expect(svg).toContain('<svg width="800" height="200"');
     expect(svg).toContain('viewBox="0 0 800 200"');
     expect(svg).toContain('</svg>');

    // Theme checks
    expect(svg).toContain('style="background-color: #121212;'); // Check dark background
    expect(svg).toContain('fill="#f0f0f0"'); // Check dark theme quote text color
    expect(svg).toContain('fill="#a0a0a0"'); // Check dark theme author color

    // Content checks
    expect(svg).toContain(`"${sampleQuote.quote}"`);
    expect(svg).toContain(`- ${sampleQuote.author}<`);
  });

  it('should generate SVG with custom dimensions', () => {
    const svg = generateQuoteSvg(sampleQuote, customDimOptions);

    // Dimension checks
    expect(svg).toContain('<svg width="500" height="150"');
    expect(svg).toContain('viewBox="0 0 500 150"');

    // Basic structure and theme checks (optional, covered elsewhere but good sanity check)
    expect(svg).toContain('</svg>');
    expect(svg).toContain('style="background-color: #121212;'); // Dark theme from options
    expect(svg).toContain(`"${sampleQuote.quote}"`); // Content still present
  });

  it('should include the full quote text without truncation', () => {
    // Use longQuote with default options for this test
    const svg = generateQuoteSvg(longQuote, defaultOptions);

    // Check that the full, original quote text is present
    // Note: using backticks to avoid issues with quotes inside the quote string
    expect(svg).toContain(`"${longQuote.quote}"`);

    // Optionally check that it doesn't contain the ellipsis added by old logic
    expect(svg).not.toContain('...');
  });

  // Keeping this as a reminder for future accessibility improvements
  it('should include basic SVG structure', () => {
    // Note: For real accessibility, consider adding <title> and <desc> elements.
    const svg = generateQuoteSvg(sampleQuote, defaultOptions);
    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });



});
