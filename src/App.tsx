import { ElasticWrapper } from './components/core/ElasticWrapper';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { MusicPlayerWidget } from './components/widgets/MusicPlayerWidget';
import { StocksWidget } from './components/widgets/StocksWidget';

function App() {
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

      <header className="text-center mb-12 relative z-20">
        <h1 className="text-6xl font-black tracking-tighter text-[var(--glass-text-primary)] mb-3 drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-br from-[var(--glass-text-primary)] to-[var(--glass-text-secondary)]">
          Glass Engine
        </h1>
        <p className="text-[var(--glass-text-secondary)] font-medium tracking-widest uppercase text-xs opacity-60">
          State of the Art Interface Physics
        </p>
      </header>

      <div
        id="widget-grid"
        role="list"
        aria-label="Glass widgets"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 perspective-1000 relative z-20 items-center justify-items-center"
      >
        <div role="listitem">
          <ElasticWrapper ariaLabel="Weather widget small">
            <WeatherWidget size="small" />
          </ElasticWrapper>
        </div>
        <div role="listitem">
          <ElasticWrapper ariaLabel="Weather widget medium">
            <WeatherWidget size="medium" />
          </ElasticWrapper>
        </div>
        <div role="listitem">
          <ElasticWrapper ariaLabel="Music player small">
            <MusicPlayerWidget size="small" />
          </ElasticWrapper>
        </div>
        <div role="listitem">
          <ElasticWrapper ariaLabel="Music player medium">
            <MusicPlayerWidget size="medium" />
          </ElasticWrapper>
        </div>
        <div role="listitem">
          <ElasticWrapper ariaLabel="Stocks widget small">
            <StocksWidget size="small" />
          </ElasticWrapper>
        </div>
        <div role="listitem">
          <ElasticWrapper ariaLabel="Stocks widget medium">
            <StocksWidget size="medium" />
          </ElasticWrapper>
        </div>
      </div>
    </div>
  );
}

export default App;
