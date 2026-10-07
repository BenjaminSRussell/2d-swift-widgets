import { GlassPane } from '../core/GlassPane';
import { Sun, Wind, Droplets, ArrowUp, Calendar, CloudRain, CloudSun } from 'lucide-react';
import { motion } from 'framer-motion';
import type { WidgetSize } from '../../types/widget';
import clsx from 'clsx';
import { useWidgetFeed } from '../../hooks/useWidgetFeed';
import { StaleBadge } from '../core/StaleBadge';
import type { WeatherPayload } from '../../types/widgetData';

interface WeatherWidgetProps {
    size?: WidgetSize;
}

export const WeatherWidget = ({ size = 'small' }: WeatherWidgetProps) => {
    const { data, stale } = useWidgetFeed<WeatherPayload>('weather');
    const currentTemp = data?.temp_f ?? 72;
    const condition = data?.condition ?? 'Partly Cloudy';
    const high = data?.high_f ?? 78;
    const low = data?.low_f ?? 62;
    const location = data?.location ?? 'San Fran';

    const sizeClasses = {
        small: "w-[155px] h-[155px]",
        medium: "w-[329px] h-[155px]",
        large: "w-[329px] h-[345px]",
    };

    return (
        <GlassPane className={clsx(
            "relative overflow-hidden group p-4 flex flex-col justify-between transition-all duration-300",
            sizeClasses[size]
        )}>
            <StaleBadge show={stale} />
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

            {/* Small Layout */}
            {size === 'small' && (
                <>
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold opacity-70 uppercase tracking-wider">{location}</span>
                        </div>
                        <Sun className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={20} />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center -mt-1">
                        <span className="text-5xl font-thin tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-white/70">
                            {currentTemp}°
                        </span>
                        <span className="text-xs font-medium opacity-70">{condition}</span>
                    </div>

                    <div className="relative z-10 flex justify-between items-center mt-1 px-1">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-medium opacity-50">H:{high}°</span>
                            <span className="text-[10px] font-medium opacity-50">L:{low}°</span>
                        </div>
                    </div>
                </>
            )}

            {/* Medium Layout */}
            {size === 'medium' && (
                <div className="relative z-10 flex w-full h-full gap-6">
                    {/* Left Side: Main Info */}
                    <div className="flex flex-col justify-between w-1/3">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold opacity-70 uppercase tracking-wider">San Francisco</span>
                            <span className="text-[10px] opacity-50">California</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-5xl font-light tracking-tighter text-white">
                                {currentTemp}°
                            </span>
                            <span className="text-xs font-medium opacity-60 text-white/80">{condition}</span>
                        </div>
                    </div>

                    {/* Right Side: Detailed Stats & Forecast */}
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-end gap-2 text-white/60">
                            <Calendar size={14} />
                            <span className="text-[10px] font-medium uppercase">Using loc: Home</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {/* Stat 1 */}
                            <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center border border-white/5 backdrop-blur-md">
                                <Wind size={16} className="text-white/60 mb-1" />
                                <span className="text-xs font-bold text-white/90">8 mph</span>
                                <span className="text-[9px] text-white/40 uppercase">Wind</span>
                            </div>
                            {/* Stat 2 */}
                            <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center border border-white/5 backdrop-blur-md">
                                <Droplets size={16} className="text-blue-300/60 mb-1" />
                                <span className="text-xs font-bold text-white/90">42%</span>
                                <span className="text-[9px] text-white/40 uppercase">Humid</span>
                            </div>
                            {/* Stat 3 */}
                            <div className="bg-white/5 rounded-lg p-2 flex flex-col items-center justify-center border border-white/5 backdrop-blur-md">
                                <ArrowUp size={16} className="text-orange-300/60 mb-1" />
                                <span className="text-xs font-bold text-white/90">{high}°</span>
                                <span className="text-[9px] text-white/40 uppercase">High</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Large Layout */}
            {size === 'large' && (
                <div className="relative z-10 flex flex-col w-full h-full p-6 gap-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <span className="text-lg font-bold opacity-90 uppercase tracking-wider">San Francisco</span>
                            <span className="text-sm opacity-60">California</span>
                        </div>
                        <Sun className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={32} />
                    </div>

                    {/* Current Temperature and Condition */}
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                        <span className="text-6xl font-light tracking-tighter text-white">
                            {currentTemp}°
                        </span>
                        <span className="text-lg font-medium opacity-70">{condition}</span>
                    </div>

                    {/* Detailed Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {/* Stat 1: Wind */}
                        <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center border border-white/5 backdrop-blur-md">
                            <Wind size={24} className="text-white/60 mb-2" />
                            <span className="text-lg font-bold text-white/90">8 mph</span>
                            <span className="text-xs text-white/40 uppercase mt-1">Wind</span>
                        </div>
                        {/* Stat 2: Humidity */}
                        <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center border border-white/5 backdrop-blur-md">
                            <Droplets size={24} className="text-blue-300/60 mb-2" />
                            <span className="text-lg font-bold text-white/90">42%</span>
                            <span className="text-xs text-white/40 uppercase mt-1">Humid</span>
                        </div>
                        {/* Stat 3: High Temp */}
                        <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center border border-white/5 backdrop-blur-md">
                            <ArrowUp size={24} className="text-orange-300/60 mb-2" />
                            <span className="text-lg font-bold text-white/90">{high}°</span>
                            <span className="text-xs text-white/40 uppercase mt-1">High</span>
                        </div>
                    </div>

                    {/* Hourly Forecast (Simple) */}
                    <div className="flex-1 flex flex-col gap-3 border-t border-white/10 pt-4 overflow-y-auto">
                        <div className="text-sm font-semibold opacity-70">Hourly Forecast</div>
                        <div className="flex gap-3">
                            {['12 AM', '1 AM', '2 AM', '3 AM', '4 AM'].map((time, idx) => (
                                <div key={time} className="flex-1 bg-white/5 rounded-lg p-3 text-center border border-white/5 backdrop-blur-md">
                                    <div className="text-xs opacity-60 mb-1">{time}</div>
                                    {idx % 2 === 0 ? (
                                        <CloudRain size={16} className="mx-auto mb-1 text-blue-300/60" />
                                    ) : (
                                        <CloudSun size={16} className="mx-auto mb-1 text-yellow-300/60" />
                                    )}
                                    <div className="text-sm font-bold">{68 - idx}°</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Calendar size={16} />
                        <span className="font-medium uppercase">Using loc: Home</span>
                    </div>
                </div>
            )}

            {/* Decoration Circles (Abstract) */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300/10 rounded-full blur-2xl z-0 pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl z-0 pointer-events-none" />
        </GlassPane>
    );
};
