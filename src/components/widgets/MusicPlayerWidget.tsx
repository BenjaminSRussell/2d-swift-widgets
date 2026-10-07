import { useState, useEffect } from 'react';
import { GlassPane } from '../core/GlassPane';
import { Play, SkipForward, SkipBack, Heart, ListMusic, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { WidgetSize } from '../../types/widget';
import clsx from 'clsx';

interface MusicPlayerWidgetProps {
    size?: WidgetSize;
}

export const MusicPlayerWidget = ({ size = 'small' }: MusicPlayerWidgetProps) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentTime, setCurrentTime] = useState(36); // 36 seconds elapsed
    const duration = 120; // 2 minutes total
    const progressPercentage = (currentTime / duration) * 100;

    // Simulate playback progression
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setCurrentTime(prev => {
                const next = prev + 1;
                return next >= duration ? duration : next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, duration]);

    const sizeClasses = {
        small: "w-[155px] h-[155px]",
        medium: "w-[329px] h-[155px]",
        large: "w-[329px] h-[345px]",
    };

    return (
        <GlassPane className={clsx(
            "relative overflow-hidden group p-0 flex flex-col transition-all duration-300",
            sizeClasses[size]
        )}>
            {/* Background Art (Shared) */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 scale-125 blur-xl opacity-40" />
            </div>

            {/* SMALL LAYOUT */}
            {size === 'small' && (
                <>
                    {/* Album Art Main */}
                    <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                        <motion.div
                            className="w-24 h-24 rounded-2xl shadow-2xl bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 overflow-hidden relative"
                            animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            {/* Fake shine */}
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent pointer-events-none" />
                        </motion.div>
                    </div>

                    {/* Minimal Controls Overlay */}
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-3 z-20">
                        <div className="flex items-center gap-4 text-white">
                            <SkipBack size={16} className="opacity-80 hover:opacity-100 cursor-pointer" />
                            <motion.div
                                className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? <div className="w-2 h-2 bg-black flex gap-0.5"><div className="w-0.5 h-full bg-black" /> <div className="w-0.5 h-full bg-black" /></div> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                            </motion.div>
                            <SkipForward size={16} className="opacity-80 hover:opacity-100 cursor-pointer" />
                        </div>
                    </div>
                </>
            )}

            {/* MEDIUM LAYOUT */}
            {size === 'medium' && (
                <div className="flex w-full h-full relative z-10 p-4 gap-4">
                    {/* Left: Album Art */}
                    <div className="h-full aspect-square flex items-center justify-center">
                        <motion.div
                            className="w-full h-full rounded-2xl shadow-2xl bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 overflow-hidden relative"
                            animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent pointer-events-none" />
                        </motion.div>
                    </div>

                    {/* Right: Details & Controls */}
                    <div className="flex-1 flex flex-col justify-center gap-1">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-lg font-bold leading-tight">Midnight City</span>
                                <span className="text-xs opacity-60 font-medium">M83 • Hurry Up, We're Dreaming</span>
                            </div>
                            <Heart size={16} className="text-pink-500 fill-pink-500" />
                        </div>

                        {/* Scrubber */}
                        <div
                            className="w-full h-1 bg-white/10 rounded-full my-3 overflow-hidden cursor-pointer"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const clickX = e.clientX - rect.left;
                                const newProgress = clickX / rect.width;
                                const newTime = Math.max(0, Math.min(newProgress * duration, duration));
                                setCurrentTime(newTime);
                            }}
                        >
                            <motion.div
                                className="h-full bg-white/90 rounded-full"
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: isPlaying ? 0.1 : 0, ease: "linear" }}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <SkipBack size={20} fill="currentColor" className="opacity-70 hover:opacity-100 cursor-pointer" />
                                <motion.div
                                    className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    {isPlaying ? <div className="w-3 h-3 bg-black flex gap-[2px]"><div className="w-1 h-full bg-black" /> <div className="w-1 h-full bg-black" /></div> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                </motion.div>
                                <SkipForward size={20} fill="currentColor" className="opacity-70 hover:opacity-100 cursor-pointer" />
                            </div>

                            <div className="flex gap-3 opacity-60">
                                <ListMusic size={16} className="hover:opacity-100 cursor-pointer" />
                                <Volume2 size={16} className="hover:opacity-100 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LARGE LAYOUT */}
            {size === 'large' && (
                <div className="flex flex-col w-full h-full relative z-10 p-6 gap-6">
                    {/* Album Art and Waveform */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-6">
                        <motion.div
                            className="w-32 h-32 rounded-2xl shadow-2xl bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 overflow-hidden relative"
                            animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent pointer-events-none" />
                        </motion.div>

                        {/* Waveform Scrubber */}
                        <div className="w-full px-6">
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white/90 rounded-full"
                                    initial={{ width: "30%" }}
                                    animate={{ width: isPlaying ? "100%" : "30%" }}
                                    transition={{ duration: 120, ease: "linear" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Song Info */}
                    <div className="flex flex-col gap-4 px-6">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col flex-1">
                                <span className="text-xl font-bold leading-tight">Midnight City</span>
                                <span className="text-sm opacity-60 font-medium">M83 • Hurry Up, We're Dreaming</span>
                            </div>
                            <Heart size={20} className="text-pink-500 fill-pink-500" />
                        </div>

                        {/* Controls */}
                        <div className="flex justify-center items-center gap-6">
                            <SkipBack size={24} fill="currentColor" className="opacity-70 hover:opacity-100 cursor-pointer" />
                            <motion.div
                                className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsPlaying(!isPlaying)}
                            >
                                {isPlaying ? <div className="w-4 h-4 bg-black flex gap-1"><div className="w-1 h-full bg-black" /> <div className="w-1 h-full bg-black" /></div> : <Play size={22} fill="currentColor" className="ml-1" />}
                            </motion.div>
                            <SkipForward size={24} fill="currentColor" className="opacity-70 hover:opacity-100 cursor-pointer" />
                        </div>

                        {/* Bottom Controls */}
                        <div className="flex justify-between items-center opacity-60">
                            <ListMusic size={18} className="hover:opacity-100 cursor-pointer" />
                            <Volume2 size={18} className="hover:opacity-100 cursor-pointer" />
                        </div>
                    </div>

                    {/* Tracklist (Simple representation) */}
                    <div className="flex-1 overflow-y-auto px-6 border-t border-white/10 pt-4">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between opacity-80 hover:opacity-100 cursor-pointer">
                                <span>1. Intro</span>
                                <span className="opacity-50">0:45</span>
                            </div>
                            <div className="flex justify-between opacity-60 hover:opacity-80 cursor-pointer">
                                <span>2. Midnight City</span>
                                <span className="opacity-50">4:37</span>
                            </div>
                            <div className="flex justify-between opacity-60 hover:opacity-80 cursor-pointer">
                                <span>3. Outro</span>
                                <span className="opacity-50">3:12</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </GlassPane>
    );
};
