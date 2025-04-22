import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Import only the remaining handler
import { getRandomQuoteSvgHandler } from '@/controllers/quote-svg.controller';
// Import only the used service function
import { getRandomQuote } from '@/services/quote.service';
import { generateQuoteSvg } from '@/services/quote-svg.service';
// Import language utils
import { DEFAULT_LANG, getSupportedLanguages } from '@/services/translate.service';
import { DEFAULT_CORS_HEADERS } from '@/utils/constants';
import type { Quote } from '@/types/quote.types';

// --- Mocks ---
// Mock only the used service function from quote.service
vi.mock('@/services/quote.service', () => ({
    getRandomQuote: vi.fn(),
}));
vi.mock('@/services/quote-svg.service'); // Still needed for generateQuoteSvg
vi.mock('@/services/translate.service', async (importOriginal) => {
    // Import the actual constants/functions we might need
    const actual = await importOriginal() as typeof import('@/services/translate.service');
    return {
        ...actual, // Keep other potential exports like DEFAULT_LANG if needed directly
        DEFAULT_LANG: 'en', // Explicitly set default for tests if needed, or use actual.DEFAULT_LANG
        getSupportedLanguages: vi.fn(() => ['en', 'es']), // Mock supported languages
    };
});

// Sample data
const sampleQuote: Quote = {
  id: 1,
  quote: 'Test Quote',
  author: 'Test Author',
  categoryId: 1,
};

const mockDb = {} as D1Database; // Mock D1Database (can be empty object for these tests)
const dummySvgString = '<svg>Mock SVG</svg>';

// --- Tests for getRandomQuoteSvgHandler ---
// Removed the describe block for getQuoteSvgHandler
describe('getRandomQuoteSvgHandler Controller', () => {
  beforeEach(() => {
    // Reset mocks before each test in this suite
    vi.mocked(getRandomQuote).mockReset();
    vi.mocked(generateQuoteSvg).mockReset(); // generateQuoteSvg is still used

    // Default mock implementations for this suite
    vi.mocked(generateQuoteSvg).mockReturnValue(dummySvgString); // Use the same dummy SVG
  });

  // Assuming a global afterEach or similar setup handles vi.restoreAllMocks()
  // If not, add it here:
  afterEach(() => {
     vi.restoreAllMocks(); // Ensure clean slate after each test
  });

  it('should return SVG for a random quote with default light theme', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);

    const request = new Request('https://example.com/random.svg');
    const response = await getRandomQuoteSvgHandler(request, mockDb);
    const responseBody = await response.text();

    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    // Expect call with default lang
    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: DEFAULT_LANG });

    expect(generateQuoteSvg).toHaveBeenCalledTimes(1);
    // Expect call with default options object
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'light', width: 800, height: 200 });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
    expect(response.headers.get('Cache-Control')).toContain('no-store'); // Check for cache headers
    expect(responseBody).toBe(dummySvgString);
  });

  it('should return SVG for a random quote with dark theme', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);

    const request = new Request('https://example.com/random.svg?theme=dark');
    const response = await getRandomQuoteSvgHandler(request, mockDb);

    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    // Expect call with default lang
    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: DEFAULT_LANG });

    expect(generateQuoteSvg).toHaveBeenCalledTimes(1);
    // Expect call with dark theme and default dimensions
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'dark', width: 800, height: 200 });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
  });

  it('should return SVG for a random quote filtered by categoryId', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);

    const request = new Request('https://example.com/random.svg?categoryId=5');
    const response = await getRandomQuoteSvgHandler(request, mockDb);

    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    // Expect call with categoryId and default lang
    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: 5, lang: DEFAULT_LANG });

    expect(generateQuoteSvg).toHaveBeenCalledTimes(1);
    // Expect call with default options object
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'light', width: 800, height: 200 });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
  });

  it('should return SVG for a random quote with specific theme and categoryId', async () => {
     vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);

     const request = new Request('https://example.com/random.svg?theme=light&categoryId=2');
     const response = await getRandomQuoteSvgHandler(request, mockDb);

     expect(getRandomQuote).toHaveBeenCalledTimes(1);
     // Expect call with categoryId and default lang
     expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: 2, lang: DEFAULT_LANG });

     expect(generateQuoteSvg).toHaveBeenCalledTimes(1);
     // Expect call with correct theme and default dimensions
     expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'light', width: 800, height: 200 });

     expect(response.status).toBe(200);
     expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
  });

  it('should return 404 if no random quote is found', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(null); // Simulate no quote found

    const request = new Request('https://example.com/random.svg');
    const response = await getRandomQuoteSvgHandler(request, mockDb);
    const responseBody = await response.text();

    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    // Expect call with default lang
    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: DEFAULT_LANG });

    expect(generateQuoteSvg).not.toHaveBeenCalled(); // Should not generate SVG

    expect(response.status).toBe(404);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
    expect(responseBody).toContain('No quote found matching the criteria');
  });

   it('should return 404 if no random quote is found for a specific category', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(null); // Simulate no quote found

    const request = new Request('https://example.com/random.svg?categoryId=99');
    const response = await getRandomQuoteSvgHandler(request, mockDb);
    const responseBody = await response.text();

    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    // Expect call with categoryId and default lang
    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { categoryId: 99, lang: DEFAULT_LANG });

    expect(generateQuoteSvg).not.toHaveBeenCalled();

    expect(response.status).toBe(404);
    expect(responseBody).toContain('No quote found matching the criteria');
  });

  it('should return 500 if getRandomQuote throws an error', async () => {
    const error = new Error('Database connection failed');
    vi.mocked(getRandomQuote).mockRejectedValue(error); // Simulate service error

    const request = new Request('https://example.com/random.svg');
    const response = await getRandomQuoteSvgHandler(request, mockDb);
    const responseBody = await response.text();

    expect(getRandomQuote).toHaveBeenCalledTimes(1);
    // Expect call with default lang
    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: DEFAULT_LANG });

    expect(generateQuoteSvg).not.toHaveBeenCalled();

    expect(response.status).toBe(500);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(DEFAULT_CORS_HEADERS['Access-Control-Allow-Origin']);
    expect(responseBody).toBe('Internal Server Error');
  });

  // --- New tests for lang, width, height parameters ---

  it('should handle valid lang parameter', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);
    const request = new Request('https://example.com/random.svg?lang=es');
    await getRandomQuoteSvgHandler(request, mockDb);

    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: 'es' });
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'light', width: 800, height: 200 });
  });

  it('should handle unsupported lang parameter by using default', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);
    const request = new Request('https://example.com/random.svg?lang=fr'); // 'fr' not in mocked ['en', 'es']
    await getRandomQuoteSvgHandler(request, mockDb);

    // Should fall back to DEFAULT_LANG ('en' in this mock setup)
    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: DEFAULT_LANG });
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'light', width: 800, height: 200 });
  });

  it('should handle valid width parameter', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);
    const request = new Request('https://example.com/random.svg?width=1000');
    await getRandomQuoteSvgHandler(request, mockDb);

    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: DEFAULT_LANG });
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'light', width: 1000, height: 200 });
  });

  it('should handle valid height parameter', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);
    const request = new Request('https://example.com/random.svg?height=300');
    await getRandomQuoteSvgHandler(request, mockDb);

    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: DEFAULT_LANG });
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'light', width: 800, height: 300 });
  });

  it('should handle invalid width parameter (string) by using default', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);
    const request = new Request('https://example.com/random.svg?width=abc');
    await getRandomQuoteSvgHandler(request, mockDb);

    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: DEFAULT_LANG });
    // Should use default width 800
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'light', width: 800, height: 200 });
  });

   it('should handle invalid width parameter (negative) by using default', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);
    const request = new Request('https://example.com/random.svg?width=-50');
    await getRandomQuoteSvgHandler(request, mockDb);

    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: DEFAULT_LANG });
    // Should use default width 800
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'light', width: 800, height: 200 });
  });

  it('should handle invalid height parameter (string) by using default', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);
    const request = new Request('https://example.com/random.svg?height=xyz');
    await getRandomQuoteSvgHandler(request, mockDb);

    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: DEFAULT_LANG });
    // Should use default height 200
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'light', width: 800, height: 200 });
  });

   it('should handle invalid height parameter (zero) by using default', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);
    const request = new Request('https://example.com/random.svg?height=0');
    await getRandomQuoteSvgHandler(request, mockDb);

    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: DEFAULT_LANG });
    // Should use default height 200
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'light', width: 800, height: 200 });
  });

  it('should handle combined valid parameters', async () => {
    vi.mocked(getRandomQuote).mockResolvedValue(sampleQuote);
    const request = new Request('https://example.com/random.svg?lang=es&theme=dark&width=600&height=150&categoryId=3');
    await getRandomQuoteSvgHandler(request, mockDb);

    expect(getRandomQuote).toHaveBeenCalledWith(mockDb, { lang: 'es', categoryId: 3 });
    expect(generateQuoteSvg).toHaveBeenCalledWith(sampleQuote, { theme: 'dark', width: 600, height: 150 });
  });

});