"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Splits a list into pages (client side).
 *
 * const p = usePagination(items, 10);
 * p.pageItems -> the rows to show now,  p.setPage(2) -> next page,  p.setPageSize(15) -> 15 rows per page
 *
 * The current page is always kept inside 1..totalPages, so if the list gets shorter
 * (for example after a refresh) you never end up on an empty page.
 */
export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [requestedPage, setRequestedPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);

  const startIndex = (page - 1) * pageSize;
  const pageItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, startIndex, pageSize]
  );

  const setPage = useCallback(
    (next: number) => setRequestedPage(Math.min(Math.max(1, next), totalPages)),
    [totalPages]
  );

  // A new page size always starts again from page 1
  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setRequestedPage(1);
  }, []);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    pageItems,
    from: totalItems === 0 ? 0 : startIndex + 1,
    to: Math.min(startIndex + pageSize, totalItems),
    setPage,
    setPageSize,
  };
}
