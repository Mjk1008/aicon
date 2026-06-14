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
