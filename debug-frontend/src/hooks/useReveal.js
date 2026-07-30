import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useReveal({ threshold = 0.15 } = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setRevealed(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReducedMotion, threshold]);

  return [ref, revealed];
}
