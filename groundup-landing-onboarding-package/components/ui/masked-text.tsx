'use client';

import React from 'react';
import { useInView } from '../../hooks/use-in-view';
import { cn } from '../../lib/utils';

interface MaskedTextProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

/**
 * Text Masking & Clipping component.
 * Text smoothly rises out of an invisible container boundary (overflow-hidden)
 * using a Quart Out cubic-bezier curve when scrolled into view.
 */
export function MaskedText({
  children,
  className,
  innerClassName,
  delay = 0,
  as: Tag = 'div',
}: MaskedTextProps) {
  const { ref, inView } = useInView<HTMLElement>({ 
    threshold: 0.05,
    rootMargin: '100px 0px 100px 0px',
  });

  const isInline = Tag === 'span';

  return (
    <Tag 
      ref={ref as React.Ref<never>} 
      className={cn(
        'overflow-hidden leading-tight',
        isInline ? 'inline-block align-top' : 'block',
        className
      )}
    >
      <span
        data-masked-text
        style={{ transitionDelay: `${delay}ms` }}
        className={cn(
          'block transition-all duration-300 ease-out will-change-transform pb-1 -mb-1',
          inView ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-90',
          innerClassName
        )}
      >
        {children}
      </span>
    </Tag>
  );
}

export default MaskedText;
