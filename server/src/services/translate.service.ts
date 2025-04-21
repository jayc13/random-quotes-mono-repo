/**
 * Interface representing the options for translating text.
 */
interface TranslateTextOptions {
  sourceLang: string; // Source language for translation
  targetLang: string; // Target language for translation
  text: string; // Text to be translated
}

export const DEFAULT_LANG = "en";

/**
 * Returns a list of supported language codes.
 * @returns {string[]} An array of supported language codes.
 */
export function getSupportedLanguages(): string[] {
  return [
    "en", // English
    "es", // Spanish
    "fr", // French
    "de", // German
    "it", // Italian
    "pt", // Portuguese
  ];
}

/**
 * Validates if the provided language code is supported.
 * @param {string} lang - The language code to validate.
 * @throws Will throw an error if the language code is not supported.
 */
export function validateLanguage(lang: string): void {
  const supportedLanguages = getSupportedLanguages();
  if (!supportedLanguages.includes(lang)) {
    throw new Error(`Unsupported target language: ${lang}`);
  }
}

interface TranslateResponse {
  input: {
    text: string; // Original text
    source_lang: string; // Source language code
    target_lang: string; // Target language code
  };
  response: {
    translated_text: string; // Translated text
  };
}

/**
 * Translates text from a source language to a target language.
 * @param {TranslateTextOptions} options - The options for translation.
 * @returns {Promise<string>} A promise that resolves to the translated text.
 * @throws Will throw an error if translation fails after trying all endpoints.
 */
export async function translateText(
  options: TranslateTextOptions,
): Promise<string> {
  const { sourceLang, targetLang, text } = options;

  validateLanguage(targetLang);

  const endpoints = [
    "https://655.mtis.workers.dev/translate",
    "https://collonoid.tasport1.workers.dev/translate",
    "https://t72.mouth-ploy-evoke.workers.dev/translate",
    "https://emergency-tas-backup1.uncoverclimatix.workers.dev/translate",
  ];

  // Parameters for translation (customize as needed)
  const params = {
    text, // Text to be translated
    source_lang: sourceLang, // Source language code
    target_lang: targetLang, // Target language code
  };

  // Try each endpoint until one works
  let result: TranslateResponse | null = null;
  for (const endpoint of endpoints) {
    const url = new URL(endpoint);
    url.search = new URLSearchParams(params).toString();

    try {
      const response: Response = await fetch(url);
      if (response.ok) {
        result = await response.json();
        break;
      }
      console.error(
        `Error at ${url}: ${response.status} - ${response.statusText}`,
      );
    } catch (error) {
      console.error(`Request exception at ${url}:`, error);
    }
  }

  if (result !== null) {
    return result?.response?.translated_text || text;
  }

  throw new Error("Translation failed after trying all endpoints.");
}
