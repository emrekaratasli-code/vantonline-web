'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode, useEffect, useState } from 'react';

interface FadeInProps {
    children: ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    duration?: number;
    className?: string;
}

export default function FadeIn({
    children,
    delay = 0,
    direction = 'up',
    duration = 0.6,
    className = '',
}: FadeInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const directionMap = {
        up: { y: 30, x: 0 },
        down: { y: -30, x: 0 },
        left: { x: 30, y: 0 },
        right: { x: -30, y: 0 },
        none: { x: 0, y: 0 },
    };

    return (
        <motion.div
            ref={ref}
            initial={
                mounted
                    ? {
                        opacity: 0,
                        ...directionMap[direction],
                    }
                    : { opacity: 1, x: 0, y: 0 }
            }
            animate={
                mounted
                    ? (isInView ? { opacity: 1, x: 0, y: 0 } : {})
                    : { opacity: 1, x: 0, y: 0 }
            }
            transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
