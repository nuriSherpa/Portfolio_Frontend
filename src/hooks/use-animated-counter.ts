// hooks/use-animated-counter.ts
import { useEffect, useRef, useState } from 'react';

export const useAnimatedCounter = (
  target: number,
  startValue: number,
  options: {
    duration?: number;
    enabled?: boolean;
  } = {},
) => {
  const { duration = 1000, enabled = true } = options;
  const [display, setDisplay] = useState(startValue);
  const frameRef = useRef<number>(0);
  const prevTarget = useRef(startValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // On first render, if enabled is false, just show target
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!enabled) {
        setDisplay(target);
        prevTarget.current = target;
        return;
      }
    }

    // If animation disabled, jump to target
    if (!enabled) {
      setDisplay(target);
      prevTarget.current = target;
      return;
    }

    // No change, don't animate
    if (target === prevTarget.current) return;

    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    cancelAnimationFrame(frameRef.current);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for smooth scrolling feel
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);

      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevTarget.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [target, startValue, enabled, duration]);

  return display;
};
