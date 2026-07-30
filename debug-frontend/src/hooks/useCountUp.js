import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

export function useCountUp(targetValue, { duration = 900 } = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(targetValue ?? 0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (targetValue == null) {
      setValue(targetValue);
      return;
    }

    if (prefersReducedMotion) {
      setValue(targetValue);
      return;
    }

    const startValue = 0;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
      setValue(startValue + (targetValue - startValue) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [targetValue, duration, prefersReducedMotion]);

  return value;
}
