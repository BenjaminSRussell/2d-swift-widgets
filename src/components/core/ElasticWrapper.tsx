import React from 'react';
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
    useVelocity,
    type HTMLMotionProps
} from 'framer-motion';

interface ElasticWrapperProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
}

export const ElasticWrapper: React.FC<ElasticWrapperProps> = ({ children, style, ...props }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Track velocity of drag
    const xVelocity = useVelocity(x);
    const yVelocity = useVelocity(y);

    // Smooth out the velocity reading to prevent jitter
    const smoothXVelocity = useSpring(xVelocity, { damping: 20, stiffness: 200 });
    const smoothYVelocity = useSpring(yVelocity, { damping: 20, stiffness: 200 });

    // Transform velocity into scale (stretch effect)
    // When moving fast in X, stretch X and squash Y
    const scaleX = useTransform(smoothXVelocity, [-1000, 0, 1000], [1.05, 1, 1.05]);
    const scaleY = useTransform(smoothYVelocity, [-1000, 0, 1000], [1.05, 1, 1.05]);

    // Simplified "Bubble" Physics:
    // Speed -> Slight Scale Up overall + Tilt
    const tiltX = useTransform(y, [-100, 100], [10, -10]); // Tilt based on position (parallax)
    const tiltY = useTransform(x, [-100, 100], [-10, 10]);

    // Bubble Radius: Deform the corners during high velocity
    const borderRadius = useTransform(smoothXVelocity, [-1000, 0, 1000], ["40px", "24px", "40px"]);

    return (
        <motion.div
            drag
            dragConstraints={{ left: -400, right: 400, top: -400, bottom: 400 }}
            dragElastic={0.2}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, borderRadius: "48px" }}
            style={{
                x,
                y,
                scaleX: scaleX,
                scaleY: scaleY,
                rotateX: tiltX,
                rotateY: tiltY,
                borderRadius,
                cursor: "grab",
                perspective: 1000,
                zIndex: 10,
                ...style
            }}
            className="overflow-hidden"
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};
