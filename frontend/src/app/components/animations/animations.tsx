'use client'
import { motion } from 'framer-motion';
import { cn } from '@/app/lib/cn';

interface MotionProps {
    children: React.ReactNode;
    className?: string;
}

export function SlidingUpAnimation({ children, className }: MotionProps) {
    const classes = cn(className);
    return (
        <motion.div
            className={classes}
            initial={{ y: 25, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            {children}
        </motion.div>
    )
}

export function RevealingAnimation({ children, className }: MotionProps) {
    const classes = cn(className);
    return (
        <motion.div
            className={classes}
            style={{ overflow: "hidden", whiteSpace: "nowrap" }}
            initial={{ width: 0 }}
            whileInView={{ width: "80%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
        >
            {children}
        </motion.div>
    )
}

export function HoveringAnimation ({ children, className }: MotionProps){
     const classes = cn(className);
     return(
        <motion.div
        className={classes}
        whileHover={{ scale: 1.1 }}
  transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
            {children}
        </motion.div>
     )
}