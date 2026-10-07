import React, { useEffect, useState } from 'react';
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
    /** Accessible name for the interactive widget shell */
    ariaLabel?: string;
}

function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(mq.matches);
        update();
        mq.addEventListener?.('change', update);
        return () => mq.removeEventListener?.('change', update);
    }, []);
    return reduced;
}

export const ElasticWrapper: React.FC<ElasticWrapperProps> = ({
    children,
    style,
    ariaLabel = 'Draggable widget',
    ...props
}) => {
    const reduceMotion = usePrefersReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xVelocity = useVelocity(x);
    const yVelocity = useVelocity(y);
    const smoothXVelocity = useSpring(xVelocity, { damping: 20, stiffness: 200 });
    const smoothYVelocity = useSpring(yVelocity, { damping: 20, stiffness: 200 });

    const scaleX = useTransform(smoothXVelocity, [-1000, 0, 1000], [1.05, 1, 1.05]);
    const scaleY = useTransform(smoothYVelocity, [-1000, 0, 1000], [1.05, 1, 1.05]);
    const tiltX = useTransform(y, [-100, 100], [10, -10]);
    const tiltY = useTransform(x, [-100, 100], [-10, 10]);
    const borderRadius = useTransform(smoothXVelocity, [-1000, 0, 1000], ["40px", "24px", "40px"]);

    if (reduceMotion) {
        return (
            <div
                role="group"
                aria-label={ariaLabel}
                tabIndex={0}
                className="overflow-hidden rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                style={{ cursor: 'default', zIndex: 10, ...style }}
            >
                {children}
            </div>
        );
    }

    return (
        <motion.div
            role="group"
            aria-label={ariaLabel}
            tabIndex={0}
            drag
            dragConstraints={{ left: -400, right: 400, top: -400, bottom: 400 }}
            dragElastic={0.2}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, borderRadius: "48px" }}
            style={{
                x,
                y,
                scaleX,
                scaleY,
                rotateX: tiltX,
                rotateY: tiltY,
                borderRadius,
                cursor: "grab",
                perspective: 1000,
                zIndex: 10,
                ...style
            }}
            className="overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};
