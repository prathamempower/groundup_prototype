'use client';

import { useEffect, useRef } from 'react';

export interface UseScrollParallaxOptions {
  layerOffsets?: number[];
  disabled?: boolean;
}

/**
 * Hook to coordinate CSS Scroll-Driven Parallax animations.
 * If native CSS scroll-driven animations are supported (animation-timeline: view()),
 * the browser's compositor handles the effect natively.
 * For unsupported browsers (such as Firefox), an IntersectionObserver + scroll listener
 * fallback updates the transform translateY properties with zero jitter.
 */
export function useScrollParallax<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollParallaxOptions = {}
) {
  const wrapperRef = useRef<T>(null);
  const { layerOffsets = [40, 80, 140, 200], disabled = false } = options;

  useEffect(() => {
    if (disabled || typeof window === 'undefined') {
      return;
    }

    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    // Respect reduced motion accessibility preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // Check for native CSS Scroll-Driven Animations support
    const hasNativeSupport =
      typeof CSS !== 'undefined' &&
      CSS.supports &&
      CSS.supports('(animation-timeline: view()) and (animation-range: entry)');

    if (hasNativeSupport) {
      // Native CSS compositor handles the animation via view-timeline
      return;
    }

    // Fallback for browsers without native scroll-driven animations (e.g. Firefox)
    const layers = wrapper.querySelectorAll<HTMLElement>('.parallax-layer');
    if (layers.length === 0) {
      return;
    }

    let isListening = false;
    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId !== null) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const scrollY = window.scrollY;
        const wrapperRect = wrapper.getBoundingClientRect();
        const wrapperTop = wrapperRect.top + scrollY;
        const wrapperHeight = wrapperRect.height;
        const windowHeight = window.innerHeight;

        if (scrollY >= wrapperTop - windowHeight && scrollY <= wrapperTop + wrapperHeight) {
          const scrollPercent = (scrollY - (wrapperTop - windowHeight)) / (wrapperHeight + windowHeight);

          layers.forEach((layer, index) => {
            const configuredOffset = layerOffsets[index] ?? 100 * (index + 1);
            const translateY = configuredOffset * (1 - scrollPercent);
            layer.style.transform = `translateY(${translateY}px)`;
          });
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isListening) {
              window.addEventListener('scroll', onScroll, { passive: true });
              isListening = true;
              onScroll();
            }
          } else {
            if (isListening) {
              window.removeEventListener('scroll', onScroll);
              isListening = false;
            }
          }
        });
      },
      { threshold: 0 }
    );

    observer.observe(wrapper);
    onScroll();

    return () => {
      observer.disconnect();
      if (isListening) {
        window.removeEventListener('scroll', onScroll);
      }
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      layers.forEach((layer) => {
        layer.style.transform = '';
      });
    };
  }, [disabled, layerOffsets]);

  return wrapperRef;
}
