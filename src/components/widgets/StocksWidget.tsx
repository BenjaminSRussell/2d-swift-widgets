import { useRef, useEffect } from 'react';
import { GlassPane } from '../core/GlassPane';
import { ArrowUpRight, TrendingUp, DollarSign } from 'lucide-react';
import type { WidgetSize } from '../../types/widget';
import clsx from 'clsx';

interface StocksWidgetProps {
    size?: WidgetSize;
}

export const StocksWidget = ({ size = 'small' }: StocksWidgetProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Dynamic dimensions based on size (could be more robust with ResizeObserver, but fixed checks work for this strict system)
    const isMedium = size === 'medium';
    // Small: 155 wide, Medium: 329 wide.
    // We'll set canvas width internally.
    const canvasWidth = isMedium ? 450 : 256; // logical width for data density
    const canvasHeight = 140;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // High DPI fix
        const dpr = window.devicePixelRatio || 1;

        // CSS Display dimensions
        // Small is ~256px logical internal coordinate space scaled down?
        // Actually, let's keep the coordinate space matching the CSS pixel ratio or fixed logic
        // We will just draw to the canvas size.

        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        canvas.style.width = `100%`; // let CSS handle the width
        canvas.style.height = `${canvasHeight}px`;
        ctx.scale(dpr, dpr);

        let animationFrameId: number;
        const points: number[] = [];
        const numPoints = isMedium ? 50 : 30; // More points for wider chart

        // Init random points
        let lastPoint = 50;
        for (let i = 0; i < numPoints; i++) {
            const change = (Math.random() - 0.5) * 20;
            lastPoint = Math.max(10, Math.min(90, lastPoint + change));
            points.push(lastPoint);
        }

        // Helper to calculate Y position with vertical padding
        const innerMargin = 8;
        const minPoint = 10;
        const maxPoint = 100;
        const calculateY = (point: number) => {
            return innerMargin + ((canvasHeight - 2 * innerMargin) * (1 - (point - minPoint) / (maxPoint - minPoint)));
        };

        const render = () => {
            // Shift data
            if (Math.random() > 0.9) {
                const change = (Math.random() - 0.45) * 15; // Slight upward trend bias
                const newPoint = Math.max(10, Math.min(100, points[points.length - 1] + change));
                points.shift();
                points.push(newPoint);
            }

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Gradient for fill
            const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)'); // Green top
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

            // Draw Path
            ctx.beginPath();
            const stepX = canvasWidth / (numPoints - 1);

            // Move to first point
            ctx.moveTo(0, calculateY(points[0]));

            // CurveTo for smooth lines
            for (let i = 0; i < points.length - 1; i++) {
                const xMid = (i * stepX + (i + 1) * stepX) / 2;
                const yMid = (calculateY(points[i]) + calculateY(points[i + 1])) / 2;
                ctx.quadraticCurveTo(i * stepX, calculateY(points[i]), xMid, yMid);
            }
            // Connect last point
            ctx.lineTo(canvasWidth, calculateY(points[points.length - 1]));

            // Close path for fill
            ctx.lineTo(canvasWidth, canvasHeight);
            ctx.lineTo(0, canvasHeight);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Stroke on top
            ctx.beginPath();
            ctx.moveTo(0, calculateY(points[0]));
            for (let i = 0; i < points.length - 1; i++) {
                const xMid = (i * stepX + (i + 1) * stepX) / 2;
                const yMid = (calculateY(points[i]) + calculateY(points[i + 1])) / 2;
                ctx.quadraticCurveTo(i * stepX, calculateY(points[i]), xMid, yMid);
            }
            ctx.lineTo(canvasWidth, calculateY(points[points.length - 1]));
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#22c55e'; // Green 500
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [isMedium, canvasWidth]);

    const sizeClasses = {
        small: "w-[155px] h-[155px]",
        medium: "w-[329px] h-[155px]",
        large: "w-[329px] h-[345px]",
    };

    return (
        <GlassPane className={clsx(
            "relative overflow-hidden group py-4 flex flex-col justify-between transition-all duration-300",
            sizeClasses[size]
        )}>
            {/* Header */}
            <div className="px-5 flex justify-between items-start z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xs">A</span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className="font-bold text-lg leading-none">AAPL</span>
                        </div>
                        <span className="text-[10px] opacity-50 font-medium uppercase tracking-wider">Apple Inc.</span>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="font-bold text-xl">$182.45</span>
                    <span className="flex items-center text-green-500 text-xs font-bold gap-0.5">
                        <ArrowUpRight size={12} /> +1.24%
                    </span>
                </div>
            </div>

            {/* Medium Layout Extras */}
            {size === 'medium' && (
                <div className="px-5 mt-1 flex gap-4 opacity-70">
                    <div className="flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-green-500" />
                        <span className="text-xs font-semibold">Bullish</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <DollarSign size={12} className="text-white/60" />
                        <span className="text-xs font-medium text-white/60">Vol: 45.2M</span>
                    </div>
                </div>
            )}

            {/* Chart Area */}
            <div className="absolute bottom-0 left-0 right-0 h-[100px] z-0">
                <canvas ref={canvasRef} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Overlay Gradient for seamless chart fade */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--glass-surface)] to-transparent pointer-events-none opacity-20" />
        </GlassPane>
    );
};
