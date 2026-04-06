'use client';

import { useEffect, useState, useMemo, useRef } from 'react';

interface ScrollingNumberProps {
  value: number;
  prevValue?: number;
  className?: string;
  animate?: boolean;
}

function ScrollingDigit({
  digit,
  prevDigit,
  delay,
  animate,
}: {
  digit: number;
  prevDigit: number;
  delay: number;
  animate: boolean;
}) {
  const [displayDigit, setDisplayDigit] = useState(animate ? prevDigit : digit);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!animate) {
        setDisplayDigit(digit);
        return;
      }
      // Animate from prevDigit to digit
      const timer = setTimeout(() => setDisplayDigit(digit), 50);
      return () => clearTimeout(timer);
    }
    // Subsequent updates
    if (!animate) {
      setDisplayDigit(digit);
    } else {
      const timer = setTimeout(() => setDisplayDigit(digit), 50);
      return () => clearTimeout(timer);
    }
  }, [digit, animate]);

  const style = useMemo(
    () => ({
      transform: `translateY(-${displayDigit * 10}%)`,
      transitionProperty: 'transform',
      transitionDuration: animate ? '0.6s' : '0s',
      transitionTimingFunction: 'cubic-bezier(0.34, 1.08, 0.64, 1)',
      transitionDelay: animate ? `${delay}ms` : '0ms',
    }),
    [displayDigit, animate, delay],
  );

  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden align-bottom">
      <span className="absolute flex flex-col" style={style}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[1em] flex items-center justify-center">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

export function ScrollingNumber({
  value = 0,
  prevValue,
  className = '',
  animate = false,
}: ScrollingNumberProps) {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const safePrev = typeof prevValue === 'number' && !isNaN(prevValue) ? prevValue : safeValue;

  const formatted = safeValue.toLocaleString();
  const prevFormatted = safePrev.toLocaleString();

  const digits = formatted.split('');
  const prevDigits = prevFormatted.split('');

  // Pad prevDigits to same length
  while (prevDigits.length < digits.length) prevDigits.unshift('0');

  const numericCount = digits.filter((d) => /\d/.test(d)).length;
  let digitIndex = 0;

  return (
    <span className={`inline-flex items-center ${className}`}>
      {digits.map((char, i) => {
        if (/\d/.test(char)) {
          const currentDigit = parseInt(char);
          const prevChar = prevDigits[i] || '0';
          const previousDigit = /\d/.test(prevChar) ? parseInt(prevChar) : 0;
          // Rightmost digit animates first, delay increases left-ward
          const delay = (numericCount - digitIndex - 1) * 50;
          digitIndex++;

          return (
            <ScrollingDigit
              key={`${i}-${safeValue}-${animate}`}
              digit={currentDigit}
              prevDigit={previousDigit}
              delay={delay}
              animate={animate && currentDigit !== previousDigit}
            />
          );
        }
        return (
          <span key={i} className="inline-block">
            {char}
          </span>
        );
      })}
    </span>
  );
}
