/** Stale-data badge; respects prefers-reduced-motion (#8). */
export function StaleBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span
      role="status"
      className="absolute top-2 right-2 z-30 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-black motion-safe:animate-pulse motion-reduce:animate-none"
    >
      Stale
    </span>
  );
}
