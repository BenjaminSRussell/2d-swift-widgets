import { useEffect, useState } from "react";
import type { WidgetKind, WidgetPayload } from "../types/widgetData";

const FIXTURE_PATH: Record<WidgetKind, string> = {
  weather: "/fixtures/weather.json",
  stocks: "/fixtures/stocks.json",
  music: "/fixtures/music.json",
};

/** Fetch widget payload from `/api/widget/{kind}` with fixture fallback (#5). */
export function useWidgetFeed<T extends WidgetPayload>(kind: T["kind"]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const api = `/api/widget/${kind}`;
    const load = async () => {
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
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [kind]);

  return { data, error, loading };
}
