import React from 'react';
import { clsx } from 'clsx';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassPaneProps extends HTMLMotionProps<"div"> {
    className?: string;
    children: React.ReactNode;
    dark?: boolean;
}

export const GlassPane = React.forwardRef<HTMLDivElement, GlassPaneProps>(
    ({ className, children, dark, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                className={clsx(
                    // Base Layout
                    "relative overflow-hidden",
                    // Glass Effect
                    "backdrop-blur-xl bg-[var(--glass-surface)]",
                    "border border-[var(--glass-border)]",
                    "shadow-[var(--shadow-lg)]",
                    // Text Colors
                    "text-[var(--glass-text-primary)]",
                    // Rounded Corners (Default)
                    "rounded-3xl",
                    className
                )}
                style={{
                    // Optional: Add specific subtle gradients here if needed
                    ...props.style
                }}
                {...props}
            >
                {/* Noise Texture Overlay */}
                <div className="bg-noise" />

                {/* Inner Highlight (Top Edge) */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--glass-highlight)] to-transparent opacity-50" />

                {/* Content */}
                <div className="relative z-20 h-full w-full">
                    {children}
                </div>
            </motion.div>
        );
    }
);

GlassPane.displayName = "GlassPane";
