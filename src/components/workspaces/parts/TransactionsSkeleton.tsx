// Placeholder rows while the wallet loads (same shape as the real rows).

export default function TransactionsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-white/10" aria-busy="true" aria-label="Loading transactions">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 py-3.5">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-white/10" />
            <div className="h-3 w-1/3 rounded bg-white/10" />
          </div>
          <div className="space-y-2">
            <div className="ml-auto h-3.5 w-20 rounded bg-white/10" />
            <div className="ml-auto h-3 w-12 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
