// Loading placeholder with the same shape as the real dashboard (soft green, matches the new page background).

const BLOCK = 'animate-pulse rounded-3xl bg-white/50 dark:bg-white/5';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-52 animate-pulse rounded-3xl bg-brand-900/70" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className={`${BLOCK} h-[132px]`} />)}
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[1, 2, 3].map((i) => <div key={i} className={`${BLOCK} h-[180px]`} />)}
      </div>
      <div className={`${BLOCK} h-[420px]`} />
    </div>
  );
}
