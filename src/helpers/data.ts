/**
 * Type safe nullish data checker
 * returns `true` if data is non nullish or `false` if nullish
 */
export function isNonNullish<Data = unknown>(
  data?: Data | null,
): data is NonNullable<Data> {
  return data !== null && typeof data !== "undefined";
}
