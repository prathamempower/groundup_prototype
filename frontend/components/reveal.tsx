'use client';

import React from 'react';
import { useInView } from '../hooks/use-in-view';
import { cn } from '../lib/utils';

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  as?: 'div' | 'section' | 'li' | 'header' | 'article' | 'main';
}

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 700,
  direction = 'up',
  as: Tag = 'div',
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.08 });

  const getHiddenTransform = () => {
    switch (direction) {
      case 'up':
        return 'translate-y-6';
      case 'down':
        return '-translate-y-6';
      case 'left':
        return 'translate-x-6';
      case 'right':
        return '-translate-x-6';
      case 'none':
      default:
        return 'translate-y-0';
    }
  };

  return (
    <Tag
      ref={ref as React.Ref<never>}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
      className={cn(
        'transition-all ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
        inView
          ? 'translate-x-0 translate-y-0 opacity-100 scale-100'
          : `${getHiddenTransform()} opacity-0 scale-[0.985]`,
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
