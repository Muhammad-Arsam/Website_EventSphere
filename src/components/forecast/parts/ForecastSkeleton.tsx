// Loading placeholder that has the same shape as the real page.

const BLOCK = 'animate-pulse rounded-3xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/3';

export default function ForecastSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading forecast">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className={`${BLOCK} h-[132px]`} />)}
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => <div key={i} className={`${BLOCK} h-[360px]`} />)}
      </div>
      <div className={`${BLOCK} h-[460px]`} />
    </div>
  );
}
