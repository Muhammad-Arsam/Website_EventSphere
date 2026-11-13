import Link from "next/link";
import { Plus } from "lucide-react";

/** Organizer shortcut. Same green gradient as before, with a light sweep on hover. */
export default function HeaderCreateEvent() {
  return (
    <Link
      href="/events/create"
      className="group relative inline-flex h-11 shrink-0 items-center gap-2 overflow-hidden rounded-xl bg-linear-to-br from-brand-500 to-brand-700 px-5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-brand-500/40 active:translate-y-0 active:scale-95"
    >
      <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <Plus className="relative size-4 transition-transform duration-300 group-hover:rotate-90" strokeWidth={2.5} />
      <span className="relative">Create Event</span>
    </Link>
  );
}
