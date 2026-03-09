// src/components/icons/arrow-up-icon.tsx
'use client';

import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ArrowUpIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowUpIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const PATH_VARIANTS: Variants = {
  normal: { d: 'm12 19-7-7 7-7', translateY: 0, opacity: 1 },
  animate: {
    d: 'm12 19-7-7 7-7',
    translateY: [0, -3, 0],
    transition: { duration: 0.4 },
  },
};

const ArrowUpIcon = forwardRef<ArrowUpIconHandle, ArrowUpIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start('animate'),
        stopAnimation: () => controls.start('normal'),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        onMouseEnter?.(e);
        if (!isControlledRef.current) {
          controls.start('animate');
        }
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        onMouseLeave?.(e);
        if (!isControlledRef.current) {
          controls.start('normal');
        }
      },
      [controls, onMouseLeave],
    );

    return (
      <div
        className={cn('cursor-pointer', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={controls}
            d="m12 19-7-7 7-7"
            initial="normal"
            variants={PATH_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M12 5v14"
            initial="normal"
            variants={{
              normal: { d: 'M12 5v14', opacity: 1 },
              animate: {
                d: ['M12 5v14', 'M12 8v11', 'M12 5v14'],
                transition: { duration: 0.4 },
              },
            }}
          />
        </svg>
      </div>
    );
  },
);

ArrowUpIcon.displayName = 'ArrowUpIcon';

export { ArrowUpIcon };
