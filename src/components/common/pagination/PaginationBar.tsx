"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageItems } from "./paginationHelpers";
import { PAGINATION_STYLE, type PaginationTone } from "./paginationTheme";

interface Props {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  tone?: PaginationTone;
  itemLabel?: string; // for example "transactions"
}

const BTN = "flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition";

// "Showing 11-20 of 47"  +  Previous | 1 2 3 ... 5 | Next
export default function PaginationBar({
  page, totalPages, from, to, totalItems, onPageChange, tone = "mint", itemLabel = "records",
}: Props) {
  const s = PAGINATION_STYLE[tone];
  const items = getPageItems(page, totalPages);

  return (
    <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className={`text-sm ${s.muted}`} aria-live="polite">
        Showing <span className={`font-semibold ${s.text}`}>{from}–{to}</span> of{" "}
        <span className={`font-semibold ${s.text}`}>{totalItems}</span> {itemLabel}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className={`${BTN} ${s.button}`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Previous</span>
          </button>

          {/* Phones: just "Page 2 of 5" */}
          <span className={`px-3 text-sm font-semibold sm:hidden ${s.text}`}>
            {page} / {totalPages}
          </span>

          {/* Larger screens: the page numbers */}
          <div className="hidden items-center gap-1.5 sm:flex">
            {items.map((item) =>
              typeof item === "number" ? (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  className={`${BTN} ${item === page ? s.active : s.button}`}
                >
                  {item}
                </button>
              ) : (
                <span key={item} className={`px-1 text-sm ${s.muted}`} aria-hidden="true">…</span>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className={`${BTN} ${s.button}`}
          >
            <span className="mr-1 hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
