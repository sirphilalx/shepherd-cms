/**
 * Concatenates class names, filtering out falsy values.
 * @param classes - Array of class names or falsy values to be joined
 * @returns A space-separated string of valid class names
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
