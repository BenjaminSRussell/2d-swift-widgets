import { useState } from 'react';
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
                        <div className="w-full h-1 bg-white/10 rounded-full my-3 overflow-hidden">
                            <motion.div
                                className="h-full bg-white/90 rounded-full"
                                initial={{ width: "30%" }}
                                animate={{ width: isPlaying ? "100%" : "30%" }}
                                transition={{ duration: 120, ease: "linear" }}
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
        </GlassPane>
    );
};
