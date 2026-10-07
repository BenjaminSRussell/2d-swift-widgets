/** Timeline reload + stale badge policy (#8). */

export type FeedKind = "weather" | "stocks" | "music";

/** Reload interval ms per feed. */
export const RELOAD_INTERVAL_MS: Record<FeedKind, number> = {
  weather: 5 * 60_000,
  stocks: 60_000,
  music: 30_000,
};

/** Consider stale after this many ms without a successful refresh. */
export const STALE_AFTER_MS: Record<FeedKind, number> = {
  weather: 10 * 60_000,
  stocks: 2 * 60_000,
  music: 2 * 60_000,
};

export function isStale(
  kind: FeedKind,
  lastOkAt: number | null,
  now: number = Date.now(),
): boolean {
  if (lastOkAt == null) return true;
  return now - lastOkAt > STALE_AFTER_MS[kind];
}
