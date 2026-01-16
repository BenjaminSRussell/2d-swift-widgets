import { ElasticWrapper } from './components/core/ElasticWrapper';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { MusicPlayerWidget } from './components/widgets/MusicPlayerWidget';
import { StocksWidget } from './components/widgets/StocksWidget';

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-10 gap-8 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="text-center mb-12 relative z-20">
        <h1 className="text-6xl font-black tracking-tighter text-[var(--glass-text-primary)] mb-3 drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-br from-[var(--glass-text-primary)] to-[var(--glass-text-secondary)]">
          Glass Engine
        </h1>
        <p className="text-[var(--glass-text-secondary)] font-medium tracking-widest uppercase text-xs opacity-60">
          State of the Art Interface Physics
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 perspective-1000 relative z-20">

        <ElasticWrapper>
          <WeatherWidget />
        </ElasticWrapper>

        <ElasticWrapper>
          <MusicPlayerWidget />
        </ElasticWrapper>

        <ElasticWrapper>
          <StocksWidget />
        </ElasticWrapper>

      </div>
    </div>
  );
}

export default App;
