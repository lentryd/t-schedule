import { join } from "path";
import { readFileSync } from "fs";

const texts = JSON.parse(
  readFileSync(join(__dirname, "../locales.json"), "utf-8")
);

/**
 * Returns the localized text for the given key and language, with optional arguments to be interpolated.
 * If the text is not available in the specified language, falls back to English.
 * @param key - The key of the text to retrieve.
 * @param lang - The language code to use. Defaults to "en".
 * @param args - Optional arguments to be interpolated into the text.
 * @returns The localized text with the interpolated arguments.
 */
export default function getText(key: string, lang = "en", ...args: any[]) {
  const textObj = texts[key];
  const text = textObj?.[lang] ?? textObj?.["en"] ?? "Some Error";

  return format(text, args);
}

/**
 * Replaces placeholders in a string with corresponding arguments.
 * @param format - The string containing placeholders.
 * @param args - The arguments to replace the placeholders with.
 * @returns The formatted string.
 */
function format(format: string, args: any[]) {
  return format.replace(/\{(\d+)\}/g, function (m, n) {
    return args[n] !== undefined ? args[n] : m;
  });
}
