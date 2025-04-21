import { beforeEach, describe, expect, it, vi } from 'vitest';
import { translateText, validateLanguage } from '../../src/services/translate.service';

global.fetch = vi.fn(),

describe('translateText', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('translateText()', () => {
    it('translates text successfully with the first endpoint', async () => {
      const options = { sourceLang: 'en', targetLang: 'fr', text: 'Hello' };
      const mockResponse = {response: { translated_text: 'Bonjour' }};

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await translateText(options);

      expect(result).toEqual(mockResponse.response.translated_text);
    });
    it('should return the text to translate if the API signature is not as expected', async () => {
      const options = { sourceLang: 'en', targetLang: 'fr', text: 'Hello' };
      const mockResponse = { bad: { jsonFormat: 'not ok' } };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await translateText(options);

      expect(result).toEqual('Hello');
    });

    it('tries multiple endpoints until one succeeds', async () => {
      const options = { sourceLang: 'en', targetLang: 'fr', text: 'Hello' };
      const mockResponse = {response: { translated_text: 'Bonjour' }};

      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      }).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await translateText(options);

      expect(result).toEqual(mockResponse.response.translated_text);
    });

    it('throws an error if all endpoints fail', async () => {
      const options = { sourceLang: 'en', targetLang: 'fr', text: 'Hello' };

      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(translateText(options)).rejects.toThrow('Translation failed after trying all endpoints.');
    });

    it('throws an error if target language is unsupported', async () => {
      const options = { sourceLang: 'en', targetLang: 'xx', text: 'Hello' };

      await expect(translateText(options)).rejects.toThrow('Unsupported target language: xx');
    });

    it('throws an error if there is a network error', async () => {
      const options = { sourceLang: 'en', targetLang: 'fr', text: 'Hello' };

      fetch.mockRejectedValue(new Error('Network Error'));

      await expect(translateText(options)).rejects.toThrow('Translation failed after trying all endpoints.');
    });
  });

  it('does not throw an error for supported language codes', () => {
    expect(() => validateLanguage('en')).not.toThrow();
    expect(() => validateLanguage('fr')).not.toThrow();
  });

  it('throws an error for unsupported language codes', () => {
    expect(() => validateLanguage('xx')).toThrow('Unsupported target language: xx');
  });

  it('logs an error when a request exception occurs', async () => {
    const options = { sourceLang: 'en', targetLang: 'fr', text: 'Hello' };
    const mockError = new Error('Network Error');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fetch.mockRejectedValueOnce(mockError);

    await expect(translateText(options)).rejects.toThrow('Translation failed after trying all endpoints.');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Request exception at'),
      mockError
    );

    consoleErrorSpy.mockRestore();
  });
});