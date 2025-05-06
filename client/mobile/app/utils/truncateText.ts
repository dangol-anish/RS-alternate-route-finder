/**
 * Shortens a string to the specified length and appends "..." if needed.
 *
 * @param text - The original string.
 * @param maxLength - Maximum allowed length before truncating.
 * @returns The truncated string with "..." if it was too long.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}
