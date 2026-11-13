const LIGHT_BACKGROUND = [
  "radial-gradient(50rem 36rem at 100% 0%, rgba(47, 160, 132, 0.45), transparent 65%)",
  "radial-gradient(46rem 34rem at 0% 100%, rgba(31, 111, 95, 0.38), transparent 65%)",
  "radial-gradient(36rem 24rem at 55% 45%, rgba(111, 207, 151, 0.35), transparent 70%)",
  "linear-gradient(160deg, #a8dcc9 0%, #7fc2aa 55%, #5fb097 100%)",
].join(", ");

const DARK_BACKGROUND = [
  "radial-gradient(48rem 34rem at 100% 0%, rgba(47, 160, 132, 0.22), transparent 65%)",
  "radial-gradient(42rem 32rem at 0% 100%, rgba(111, 207, 151, 0.09), transparent 65%)",
  "linear-gradient(180deg, #0c111d 0%, #08201b 100%)",
].join(", ");

export default function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Colour layers (one per theme) */}
      <div className="absolute inset-0 dark:hidden" style={{ background: LIGHT_BACKGROUND }} />
      <div className="absolute inset-0 hidden dark:block" style={{ background: DARK_BACKGROUND }} />

      {/* Rings in the top-right corner, echoing the globe in the EventSphere logo */}
      <div className="absolute -right-48 -top-48 grid size-160 place-items-center">
        <div className="absolute size-160 rounded-full border-2 border-brand-700/55 dark:border-white/10" />
        <div className="absolute size-120 rounded-full border-2 border-brand-700/55 dark:border-white/10" />
        <div className="absolute size-80 rounded-full border-[3px] border-brand-700/55 bg-brand-500/10 dark:border-white/15 dark:bg-white/3" />
      </div>

      {/* Dot grid that fades out towards the bottom */}
      <div className="absolute inset-0 bg-size-[26px_26px] mask-[linear-gradient(to_bottom,black,transparent_90%)] bg-[radial-gradient(circle_at_2px_2px,rgba(19,68,58,0.6)_1.5px,transparent_0)] dark:bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.14)_1.5px,transparent_0)]" />
    </div>
  );
}
