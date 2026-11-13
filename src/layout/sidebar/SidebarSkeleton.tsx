import SidebarShell from "./SidebarShell";

/** Shown until the user's role is known (same shell, shimmering placeholders). */
export default function SidebarSkeleton({ isOpen }: { isOpen: boolean }) {
  return (
    <SidebarShell isOpen={isOpen} isMobileOpen={false}>
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <div className="size-11 shrink-0 animate-pulse rounded-2xl bg-white/10" />
        {isOpen && <div className="h-5 w-32 animate-pulse rounded-lg bg-white/10" />}
      </div>
      <div className="space-y-3 px-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-11 animate-pulse rounded-xl bg-white/6" />
        ))}
      </div>
    </SidebarShell>
  );
}
