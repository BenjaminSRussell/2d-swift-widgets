import { useState } from 'react';
import { GlassPane } from '../core/GlassPane';
import { Play, SkipForward, SkipBack, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const MusicPlayerWidget = () => {
    const [isPlaying, setIsPlaying] = useState(true);

    // Mock Album Art (Using a nice unsplash gradient/abstract image if possible, or a colored div)
    // Using a colored div gradient for now to avoid external image deps breaking

    return (
        <GlassPane className="h-64 w-64 flex flex-col p-0 relative overflow-hidden group">
            {/* Album Art Background (Blurred) */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 scale-125 blur-xl opacity-40" />
            </div>

            {/* Album Art Main */}
            <div className="flex-1 flex items-center justify-center p-6 pb-2 relative z-10">
                <motion.div
                    className="w-32 h-32 rounded-2xl shadow-2xl bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 overflow-hidden relative"
                    animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                >
                    {/* Fake shine */}
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent pointer-events-none" />
                </motion.div>
            </div>

            {/* Controls Container */}
            <div className="h-24 bg-white/10 backdrop-blur-md flex flex-col justify-center px-5 relative z-20 border-t border-white/10">

                {/* Meta */}
                <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold truncate">Midnight City</span>
                        <span className="text-[10px] opacity-60 font-medium truncate">M83</span>
                    </div>
                    <Heart size={16} className="text-pink-500 fill-pink-500" />
                </div>

                {/* Progress */}
                <div className="w-full h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
                    <motion.div
                        className="h-full bg-white/90 rounded-full"
                        initial={{ width: "30%" }}
                        animate={{ width: isPlaying ? "100%" : "30%" }}
                        transition={{ duration: 120, ease: "linear" }}
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-between items-center px-2">
                    <SkipBack size={18} fill="currentColor" className="opacity-70 hover:opacity-100 cursor-pointer" />
                    <motion.div
                        className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <div className="w-3 h-3 bg-black rounded-[1px] gap-[2px] flex"><div className="w-1 h-full bg-black" /> <div className="w-1 h-full bg-black" /></div> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </motion.div>
                    <SkipForward size={18} fill="currentColor" className="opacity-70 hover:opacity-100 cursor-pointer" />
                </div>
            </div>
        </GlassPane>
    );
};
