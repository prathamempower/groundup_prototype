'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface RotatingWordProps {
  words: string[];
  intervalMs?: number;
  className?: string;
  wordClassName?: string;
}

export function RotatingWord({
  words,
  intervalMs = 3200,
  className,
  wordClassName,
}: RotatingWordProps) {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (words.length <= 1) return;

    const interval = setInterval(() => {
      setPrevIndex(index);
      setIsTransitioning(true);
      setIndex((current) => (current + 1) % words.length);

      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setPrevIndex(null);
      }, 550); // Matches kinetic-slide animation duration

      return () => clearTimeout(timeout);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [words, intervalMs, index]);

  const currentWord = words[index];
  const prevWord = prevIndex !== null ? words[prevIndex] : null;

  return (
    <span 
      className={cn(
        "inline-grid relative overflow-hidden align-baseline h-[1.35em] pb-1 select-none text-left", 
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Outgoing Word */}
      {isTransitioning && prevWord !== null && (
        <span
          key={`prev-${prevWord}`}
          className={cn(
            "col-start-1 row-start-1 inline-block animate-kinetic-out transform-gpu",
            wordClassName
          )}
          aria-hidden="true"
        >
          {prevWord}
        </span>
      )}

      {/* Incoming / Active Word */}
      <span
        key={`curr-${currentWord}`}
        className={cn(
          "col-start-1 row-start-1 inline-block transform-gpu",
          isTransitioning ? "animate-kinetic-in" : "translate-y-0 opacity-100",
          wordClassName
        )}
      >
        {currentWord}
      </span>
    </span>
  );
}

export default RotatingWord;
