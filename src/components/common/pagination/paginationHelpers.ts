export const PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50];
export const DEFAULT_PAGE_SIZE = 10;

export type PageItem = number | "dots-left" | "dots-right";

/**
 * Which page buttons to show. Always the first and last page, plus the pages around the current one.
 *  total 5            ->  1 2 3 4 5
 *  total 12, page 1   ->  1 2 3 4 5 … 12
 *  total 12, page 6   ->  1 … 5 6 7 … 12
 *  total 12, page 12  ->  1 … 8 9 10 11 12
 */
export const getPageItems = (page: number, totalPages: number): PageItem[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  if (page <= 4) return [1, 2, 3, 4, 5, "dots-right", totalPages];
  if (page >= totalPages - 3) {
    return [1, "dots-left", ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
  }
  return [1, "dots-left", page - 1, page, page + 1, "dots-right", totalPages];
};
