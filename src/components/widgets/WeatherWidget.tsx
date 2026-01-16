import { GlassPane } from '../core/GlassPane';
import { Sun, Wind, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

export const WeatherWidget = () => {
    // Mock Data
    const currentTemp = 72;
    const condition = "Partly Cloudy";

    return (
        <GlassPane className="h-64 w-64 flex flex-col justify-between p-6 relative overflow-hidden group">
            {/* Background Gradient - Animated */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-orange-400/20 opacity-50 z-0"
                animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
            />

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-sm font-medium opacity-60 uppercase tracking-wider">San Francisco</span>
                    <span className="text-xs opacity-40">California</span>
                </div>
                <Sun className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={24} />
            </div>

            {/* Main Temp */}
            <div className="relative z-10 flex flex-col items-center justify-center -mt-2">
                <span className="text-6xl font-thin tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
                    {currentTemp}°
                </span>
                <span className="text-sm font-medium opacity-70 mt-1">{condition}</span>
            </div>

            {/* Footer Stats */}
            <div className="relative z-10 grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                    <Wind size={14} className="opacity-50" />
                    <span className="text-xs font-semibold">8 mph</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                    <Droplets size={14} className="opacity-50" />
                    <span className="text-xs font-semibold">42%</span>
                </div>
            </div>

            {/* Decoration Circles (Abstract) */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300/10 rounded-full blur-2xl z-0 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl z-0 pointer-events-none" />
        </GlassPane>
    );
};
