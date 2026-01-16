import { useRef, useEffect } from 'react';
import { GlassPane } from '../core/GlassPane';
import { ArrowUpRight } from 'lucide-react';

export const StocksWidget = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // High DPI fix
        const dpr = window.devicePixelRatio || 1;
        // We assume 256x256 minus padding
        const width = 256;
        const height = 140; // Height of chart area
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        let animationFrameId: number;
        const points: number[] = [];
        const numPoints = 30; // Number of data points

        // Init random points
        let lastPoint = 50;
        for (let i = 0; i < numPoints; i++) {
            const change = (Math.random() - 0.5) * 20;
            lastPoint = Math.max(10, Math.min(90, lastPoint + change));
            points.push(lastPoint);
        }

        const render = () => {
            // Shift data
            if (Math.random() > 0.9) {
                const change = (Math.random() - 0.45) * 15; // Slight upward trend bias
                const newPoint = Math.max(10, Math.min(100, points[points.length - 1] + change));
                points.shift();
                points.push(newPoint);
            }

            ctx.clearRect(0, 0, width, height);

            // Gradient for fill
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)'); // Green top
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0.0)');

            // Draw Path
            ctx.beginPath();
            const stepX = width / (numPoints - 1);

            // Move to first point
            ctx.moveTo(0, height - points[0]);

            // CurveTo for smooth lines
            for (let i = 0; i < points.length - 1; i++) {
                const xMid = (i * stepX + (i + 1) * stepX) / 2;
                const yMid = ((height - points[i]) + (height - points[i + 1])) / 2;
                ctx.quadraticCurveTo(i * stepX, height - points[i], xMid, yMid);
            }
            // Connect last point
            ctx.lineTo(width, height - points[points.length - 1]);

            // Close path for fill
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Stroke on top
            ctx.beginPath();
            ctx.moveTo(0, height - points[0]);
            for (let i = 0; i < points.length - 1; i++) {
                const xMid = (i * stepX + (i + 1) * stepX) / 2;
                const yMid = ((height - points[i]) + (height - points[i + 1])) / 2;
                ctx.quadraticCurveTo(i * stepX, height - points[i], xMid, yMid);
            }
            ctx.lineTo(width, height - points[points.length - 1]);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#22c55e'; // Green 500
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <GlassPane className="h-64 w-64 flex flex-col justify-between py-6 px-0 relative overflow-hidden">
            {/* Header */}
            <div className="px-6 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                            <span className="text-white font-bold text-xs">A</span>
                        </div>
                        <span className="font-bold text-lg">AAPL</span>
                    </div>
                    <span className="text-xs opacity-50 font-medium ml-1">Apple Inc.</span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="font-bold text-xl">$182.45</span>
                    <span className="flex items-center text-green-500 text-xs font-bold gap-0.5">
                        <ArrowUpRight size={12} /> +1.24%
                    </span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full relative mt-4">
                <canvas ref={canvasRef} className="absolute bottom-0 left-0 w-full h-[140px]" />
            </div>
        </GlassPane>
    );
};
