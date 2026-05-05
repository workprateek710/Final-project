export const SORT_OPTIONS = [
  { label: "Most purchased", value: "popular" },
  { label: "Most reviewed", value: "reviews" },
  { label: "Highest rated", value: "rating" },
  { label: "Price: low to high", value: "price-low" },
  { label: "Price: high to low", value: "price-high" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const SORT_VALUES = new Set<string>(SORT_OPTIONS.map((option) => option.value));

export function parseSortOption(value?: string): SortOption | undefined {
  return value && SORT_VALUES.has(value) ? (value as SortOption) : undefined;
}
