/** Widget layout persistence (#6). */

export type WidgetId =
  | "weather-small"
  | "weather-medium"
  | "music-small"
  | "music-medium"
  | "stocks-small"
  | "stocks-medium";

export interface LayoutEntry {
  id: WidgetId;
  visible: boolean;
  order: number;
}

export interface LayoutState {
  version: 1;
  entries: LayoutEntry[];
}

export const DEFAULT_LAYOUT: LayoutState = {
  version: 1,
  entries: [
    { id: "weather-small", visible: true, order: 0 },
    { id: "weather-medium", visible: true, order: 1 },
    { id: "music-small", visible: true, order: 2 },
    { id: "music-medium", visible: true, order: 3 },
    { id: "stocks-small", visible: true, order: 4 },
    { id: "stocks-medium", visible: true, order: 5 },
  ],
};

export const STORAGE_KEY = "glass-engine.layout.v1";

export function serializeLayout(state: LayoutState): string {
  return JSON.stringify(state);
}

export function deserializeLayout(raw: string): LayoutState {
  const parsed = JSON.parse(raw) as LayoutState;
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.entries)) {
    throw new Error("invalid layout payload");
  }
  const ids = new Set(DEFAULT_LAYOUT.entries.map((e) => e.id));
  for (const e of parsed.entries) {
    if (!ids.has(e.id) || typeof e.visible !== "boolean" || typeof e.order !== "number") {
      throw new Error(`invalid entry ${JSON.stringify(e)}`);
    }
  }
  return parsed;
}

export function loadLayout(storage: Storage = localStorage): LayoutState {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_LAYOUT);
    return deserializeLayout(raw);
  } catch {
    return structuredClone(DEFAULT_LAYOUT);
  }
}

export function saveLayout(state: LayoutState, storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, serializeLayout(state));
}

export function exportLayoutJson(state: LayoutState): string {
  return serializeLayout(state);
}

export function importLayoutJson(raw: string): LayoutState {
  return deserializeLayout(raw);
}

export function toggleVisible(state: LayoutState, id: WidgetId): LayoutState {
  return {
    ...state,
    entries: state.entries.map((e) =>
      e.id === id ? { ...e, visible: !e.visible } : e,
    ),
  };
}

export function moveEntry(state: LayoutState, id: WidgetId, dir: -1 | 1): LayoutState {
  const sorted = [...state.entries].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((e) => e.id === id);
  if (idx < 0) return state;
  const j = idx + dir;
  if (j < 0 || j >= sorted.length) return state;
  const a = sorted[idx];
  const b = sorted[j];
  const next = state.entries.map((e) => {
    if (e.id === a.id) return { ...e, order: b.order };
    if (e.id === b.id) return { ...e, order: a.order };
    return e;
  });
  return { ...state, entries: next };
}

export function visibleOrdered(state: LayoutState): LayoutEntry[] {
  return [...state.entries].filter((e) => e.visible).sort((a, b) => a.order - b.order);
}
