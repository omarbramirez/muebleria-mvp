'use client';
import { motion } from 'framer-motion';
import { cn } from '@/app/lib/cn';
import React from 'react';

type MotionWrapperProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<T>;

export function MotionWrapper<T extends React.ElementType = 'div'>({
  as,
  children,
  className,
  ...props
}: MotionWrapperProps<T>) {
  const Component = as || 'div';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <Component className={cn(className)} {...props}>
        {children}
      </Component>
    </motion.div>
  );
}
