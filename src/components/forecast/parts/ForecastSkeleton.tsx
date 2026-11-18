// Loading placeholder for the part below the KPI cards (the KPI cards show their own spinners).
// Soft green blocks, so it fits the page background.

const BLOCK = 'animate-pulse rounded-3xl bg-white/50 dark:bg-white/5';

export default function ForecastSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading forecast">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => <div key={i} className={`${BLOCK} h-[400px]`} />)}
      </div>
      <div className={`${BLOCK} h-[460px]`} />
    </div>
  );
}
