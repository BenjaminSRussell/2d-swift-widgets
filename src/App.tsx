import { useMemo, useState, type ReactNode } from "react";
import { ElasticWrapper } from "./components/core/ElasticWrapper";
import { WeatherWidget } from "./components/widgets/WeatherWidget";
import { MusicPlayerWidget } from "./components/widgets/MusicPlayerWidget";
import { StocksWidget } from "./components/widgets/StocksWidget";
import {
  type LayoutState,
  type WidgetId,
  exportLayoutJson,
  importLayoutJson,
  loadLayout,
  moveEntry,
  saveLayout,
  toggleVisible,
  visibleOrdered,
} from "./layout/store";

const WIDGETS: Record<
  WidgetId,
  { label: string; node: ReactNode }
> = {
  "weather-small": {
    label: "Weather small",
    node: (
      <ElasticWrapper ariaLabel="Weather widget small">
        <WeatherWidget size="small" />
      </ElasticWrapper>
    ),
  },
  "weather-medium": {
    label: "Weather medium",
    node: (
      <ElasticWrapper ariaLabel="Weather widget medium">
        <WeatherWidget size="medium" />
      </ElasticWrapper>
    ),
  },
  "music-small": {
    label: "Music small",
    node: (
      <ElasticWrapper ariaLabel="Music player small">
        <MusicPlayerWidget size="small" />
      </ElasticWrapper>
    ),
  },
  "music-medium": {
    label: "Music medium",
    node: (
      <ElasticWrapper ariaLabel="Music player medium">
        <MusicPlayerWidget size="medium" />
      </ElasticWrapper>
    ),
  },
  "stocks-small": {
    label: "Stocks small",
    node: (
      <ElasticWrapper ariaLabel="Stocks widget small">
        <StocksWidget size="small" />
      </ElasticWrapper>
    ),
  },
  "stocks-medium": {
    label: "Stocks medium",
    node: (
      <ElasticWrapper ariaLabel="Stocks widget medium">
        <StocksWidget size="medium" />
      </ElasticWrapper>
    ),
  },
};

function App() {
  const [layout, setLayout] = useState<LayoutState>(() => loadLayout());
  const visible = useMemo(() => visibleOrdered(layout), [layout]);

  function commit(next: LayoutState) {
    setLayout(next);
    saveLayout(next);
  }

  function onExport() {
    const blob = new Blob([exportLayoutJson(layout)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "glass-layout.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImport(file: File | null) {
    if (!file) return;
    file.text().then((text) => {
      try {
        commit(importLayoutJson(text));
      } catch (e) {
        alert(`Import failed: ${e}`);
      }
    });
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-10 gap-8 relative overflow-hidden">
      <a
        href="#widget-grid"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded-md"
      >
        Skip to widgets
      </a>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="text-center mb-6 relative z-20">
        <h1 className="text-6xl font-black tracking-tighter text-[var(--glass-text-primary)] mb-3 drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-br from-[var(--glass-text-primary)] to-[var(--glass-text-secondary)]">
          Glass Engine
        </h1>
        <p className="text-[var(--glass-text-secondary)] font-medium tracking-widest uppercase text-xs opacity-60">
          State of the Art Interface Physics
        </p>
      </header>

      <section
        className="relative z-20 w-full max-w-3xl rounded-2xl border border-white/10 bg-black/20 p-4 text-[var(--glass-text-secondary)] backdrop-blur"
        aria-label="Layout controls"
      >
        <div className="mb-2 flex flex-wrap gap-2">
          <button type="button" className="rounded-md border border-white/20 px-3 py-1 text-xs" onClick={onExport}>
            Export layout JSON
          </button>
          <label className="rounded-md border border-white/20 px-3 py-1 text-xs cursor-pointer">
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => onImport(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <ul className="grid gap-1 sm:grid-cols-2">
          {[...layout.entries].sort((a, b) => a.order - b.order).map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={e.visible}
                  onChange={() => commit(toggleVisible(layout, e.id))}
                />
                {WIDGETS[e.id].label}
              </label>
              <span className="flex gap-1">
                <button type="button" className="border border-white/20 px-1" onClick={() => commit(moveEntry(layout, e.id, -1))} aria-label={`Move ${e.id} earlier`}>
                  ↑
                </button>
                <button type="button" className="border border-white/20 px-1" onClick={() => commit(moveEntry(layout, e.id, 1))} aria-label={`Move ${e.id} later`}>
                  ↓
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {visible.length === 0 ? (
        <p className="relative z-20 text-sm text-[var(--glass-text-secondary)]" role="status">
          All widgets hidden — enable at least one above.
        </p>
      ) : (
        <div
          id="widget-grid"
          role="list"
          aria-label="Glass widgets"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 perspective-1000 relative z-20 items-center justify-items-center"
        >
          {visible.map((e) => (
            <div role="listitem" key={e.id}>
              {WIDGETS[e.id].node}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
