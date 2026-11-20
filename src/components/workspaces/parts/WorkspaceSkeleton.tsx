// Loading placeholder with the same shape as the real page (soft green, like DashboardSkeleton).

const BLOCK = 'animate-pulse rounded-3xl bg-white/50 dark:bg-white/5';

export default function WorkspaceSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading organization">
      <div className="h-52 animate-pulse rounded-3xl bg-brand-900/70" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className={`${BLOCK} h-[132px]`} />)}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className={`${BLOCK} h-[420px]`} />
        <div className="h-[420px] animate-pulse rounded-3xl bg-brand-900/60 xl:col-span-2" />
      </div>
    </div>
  );
}
