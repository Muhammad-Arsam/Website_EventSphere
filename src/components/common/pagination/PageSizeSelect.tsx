"use client";

import { ChevronDown } from "lucide-react";
import { PAGINATION_STYLE, type PaginationTone } from "./paginationTheme";

interface Props {
  value: number;
  options: number[];
  onChange: (size: number) => void;
  tone?: PaginationTone;
  id?: string;
}

// "Rows per page: [ 10 v ]"
export default function PageSizeSelect({ value, options, onChange, tone = "mint", id = "page-size" }: Props) {
  const s = PAGINATION_STYLE[tone];

  return (
    <div className="flex items-center gap-2.5">
      <label htmlFor={id} className={`whitespace-nowrap text-sm font-medium ${s.muted}`}>
        Rows per page
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`h-10 cursor-pointer appearance-none rounded-xl py-0 pl-3.5 pr-9 text-sm font-semibold outline-none transition ${s.select}`}
        >
          {options.map((size) => (
            <option key={size} value={size} className={s.option}>
              {size}
            </option>
          ))}
        </select>
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${s.muted}`} />
      </div>
    </div>
  );
}
