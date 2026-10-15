'use client';

import { useEffect, useRef } from 'react';

export interface UseScrollParallaxOptions {
  layerOffsets?: number[];
  disabled?: boolean;
  speedMultiplier?: number;
}

/**
 * Universal GPU-accelerated Scroll Parallax Hook.
 * Coordinates smooth spatial depth using requestAnimationFrame and IntersectionObserver.
 * Operates on .parallax-layer children without layout thrashing.
 * Respects prefers-reduced-motion and gracefully resets transforms upon unmount.
 */
export function useScrollParallax<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollParallaxOptions = {}
) {
  const wrapperRef = useRef<T>(null);
  const { layerOffsets = [-15, 12, -20, 15, -10], disabled = false, speedMultiplier = 1 } = options;

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

    const layers = wrapper.querySelectorAll<HTMLElement>('.parallax-layer');
    if (layers.length === 0) {
      return;
    }

    let isListening = false;
    let rafId: number | null = null;

    const updateParallax = () => {
      rafId = null;
      const rect = wrapper.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Wrapper center relative to viewport center (-1 to 1)
      const wrapperCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const normalizedOffset = (wrapperCenter - viewportCenter) / (windowHeight / 2);

      // Clamp to reasonable bounds to prevent over-extension
      const clampedOffset = Math.max(-1.5, Math.min(1.5, normalizedOffset));

      layers.forEach((layer, index) => {
        // Allow per-element data-parallax-speed override, otherwise use layerOffsets array
        const customSpeed = layer.dataset.parallaxSpeed ? parseFloat(layer.dataset.parallaxSpeed) : null;
        const baseOffset = customSpeed !== null ? customSpeed : (layerOffsets[index % layerOffsets.length] ?? 15);
        const translateY = Math.round(baseOffset * clampedOffset * speedMultiplier * 10) / 10;

        layer.style.transform = `translate3d(0, ${translateY}px, 0)`;
        layer.style.willChange = 'transform';
      });
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateParallax);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isListening) {
              window.addEventListener('scroll', onScroll, { passive: true });
              window.addEventListener('resize', onScroll, { passive: true });
              isListening = true;
              onScroll();
            }
          } else {
            if (isListening) {
              window.removeEventListener('scroll', onScroll);
              window.removeEventListener('resize', onScroll);
              isListening = false;
            }
            if (rafId !== null) {
              window.cancelAnimationFrame(rafId);
              rafId = null;
            }
          }
        });
      },
      { threshold: 0, rootMargin: '100px 0px 100px 0px' }
    );

    observer.observe(wrapper);
    onScroll();

    return () => {
      observer.disconnect();
      if (isListening) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      layers.forEach((layer) => {
        layer.style.transform = '';
        layer.style.willChange = '';
      });
    };
  }, [disabled, layerOffsets, speedMultiplier]);

  return wrapperRef;
}
