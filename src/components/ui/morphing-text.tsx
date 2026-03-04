// src/components/ui/morphing-text.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface MorphingTextProps {
  texts: string[];
  className?: string;
  interval?: number; // Time between swaps in milliseconds
}

export const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
  interval = 4000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(texts[0]);
  const [isGlitching, setIsGlitching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Fixed here

  useEffect(() => {
    const startGlitch = () => {
      setIsGlitching(true);

      const nextIndex = (currentIndex + 1) % texts.length;
      const targetText = texts[nextIndex];

      // Simple glitch steps
      // unique charecters
      let step = 0;
      const glitchChars = '∞¢£¥§±µ¶•ªº¿'.split(''); // Unique glitch characters
      const glitchInterval = setInterval(() => {
        step++;

        if (step <= 3) {
          // Apply glitch effect for steps 1-3
          const glitchIntensity = step === 3 ? 0.6 : 0.7; // Higher intensity for step 3
          const randomChar = () => glitchChars[Math.floor(Math.random() * glitchChars.length)];

          setDisplayText(
            targetText
              .split('')
              .map((char) => (Math.random() > glitchIntensity ? randomChar() : char))
              .join(''),
          );
        } else {
          // End glitch
          clearInterval(glitchInterval);
          setDisplayText(targetText);
          setCurrentIndex(nextIndex);
          setIsGlitching(false);
        }
      }, 80); // Quick subtle glitches
    };

    timeoutRef.current = setInterval(startGlitch, interval);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [currentIndex, texts, interval]);

  return (
    <span
      className={cn('inline-block', className)}
      style={{
        color: '#bf1e2d', // Your red color always
        transform: isGlitching ? 'skew(-0.5deg) translate(1px, 0)' : 'none',
        transition: 'transform 0.25s ease',
      }}
    >
      {displayText}
    </span>
  );
};
