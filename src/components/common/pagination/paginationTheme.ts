// Colors for the pagination controls. Full class names, so Tailwind can see them.
// "forest" = on the deep green cards, "mint" = on the soft green cards (same two tones as the dashboard).

export type PaginationTone = "forest" | "mint";

export const PAGINATION_STYLE: Record<
  PaginationTone,
  { text: string; muted: string; button: string; active: string; select: string; option: string }
> = {
  forest: {
    text: "text-white",
    muted: "text-white/65",
    button:
      "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10",
    active: "bg-brand-300 text-brand-950 ring-1 ring-brand-200 shadow-md shadow-brand-950/30",
    select: "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15 focus:ring-brand-300",
    option: "bg-brand-950 text-white",
  },
  mint: {
    text: "text-gray-900 dark:text-white",
    muted: "text-gray-500 dark:text-gray-400",
    button:
      "bg-white/80 text-gray-700 ring-1 ring-brand-100 hover:bg-white disabled:opacity-40 disabled:hover:bg-white/80 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 dark:hover:bg-white/10",
    active: "bg-brand-600 text-white ring-1 ring-brand-500 shadow-md shadow-brand-600/25",
    select:
      "bg-white/80 text-gray-800 ring-1 ring-brand-200 hover:bg-white focus:ring-brand-500 dark:bg-white/5 dark:text-white dark:ring-white/15",
    option: "bg-white text-gray-900 dark:bg-gray-900 dark:text-white",
  },
};
