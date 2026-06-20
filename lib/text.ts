/**
 * Splits a string into [grapheme] arrays. Persian-safe — uses Intl.Segmenter
 * (browser API) when available, falls back to Array.from for SSR.
 */
export function graphemes(input: string, locale = "en"): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new (Intl as unknown as { Segmenter: typeof Intl.Segmenter }).Segmenter(locale, {
      granularity: "grapheme",
    });
    return Array.from(seg.segment(input), (s) => s.segment);
  }
  return Array.from(input);
}

/** Split a sentence into [word, space, word, space, ...] preserving ws. */
export function tokensWithSpaces(input: string): string[] {
  return input.split(/(\s+)/).filter(Boolean);
}

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
/** Convert Latin digits (0-9) to Persian (۰-۹). Pass-through for other chars. */
export function toFaDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[+d]);
}
/** Convert digits to the locale-appropriate script. */
export function localizeDigits(input: string | number, locale: string): string {
  return locale === "fa" ? toFaDigits(input) : String(input);
}
