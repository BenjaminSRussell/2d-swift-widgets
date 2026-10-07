import { useEffect, useState } from "react";
import type { WidgetKind, WidgetPayload } from "../types/widgetData";
import { RELOAD_INTERVAL_MS, isStale, type FeedKind } from "../feeds/stale";

const FIXTURE_PATH: Record<WidgetKind, string> = {
  weather: "/fixtures/weather.json",
  stocks: "/fixtures/stocks.json",
  music: "/fixtures/music.json",
};

/** Fetch widget payload from `/api/widget/{kind}` with fixture fallback (#5/#8). */
export function useWidgetFeed<T extends WidgetPayload>(kind: T["kind"]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastOkAt, setLastOkAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    const api = `/api/widget/${kind}`;
    const load = async () => {
      setLoading(true);
      try {
        let res = await fetch(api);
        if (!res.ok) {
          res = await fetch(FIXTURE_PATH[kind]);
        }
        if (!res.ok) throw new Error(`feed ${kind} HTTP ${res.status}`);
        const json = (await res.json()) as T;
        if (alive) {
          setData(json);
          setError(null);
          setLastOkAt(Date.now());
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const reloadMs = RELOAD_INTERVAL_MS[kind as FeedKind];
    const reloadTimer = window.setInterval(load, reloadMs);
    const tick = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => {
      alive = false;
      window.clearInterval(reloadTimer);
      window.clearInterval(tick);
    };
  }, [kind]);

  const stale = isStale(kind as FeedKind, lastOkAt, now);
  return { data, error, loading, lastOkAt, stale };
}
