// Loading placeholder for the Demand Forecast page (soft green blocks, same style as the dashboard).
//
// Two stages, the same as on the dashboard:
//  1) while the events load:      skeleton blocks for the KPI cards too   -> <ForecastSkeleton withKpis />
//  2) while the forecast loads:   the KPI cards are shown with spinners,   -> <ForecastSkeleton />
//     so only the part below them is a skeleton.

const BLOCK = 'animate-pulse rounded-3xl bg-white/50 dark:bg-white/5';

export default function ForecastSkeleton({ withKpis = false }: { withKpis?: boolean }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading forecast">
      {withKpis && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className={`${BLOCK} h-[160px]`} />)}
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => <div key={i} className={`${BLOCK} h-[400px]`} />)}
      </div>
      <div className={`${BLOCK} h-[460px]`} />
    </div>
  );
}
