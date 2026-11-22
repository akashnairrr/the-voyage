'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Counts down from `seconds` while `running` is true and calls `onExpire`
 * once at zero. Remount the component (via `key`) to restart it.
 */
export function useCountdown(seconds: number, running: boolean, onExpire: () => void): number {
  const [deadline] = useState(() => Date.now() + seconds * 1000);
  const [msLeft, setMsLeft] = useState(seconds * 1000);
  const expire = useRef(onExpire);
  const fired = useRef(false);

  useEffect(() => {
    expire.current = onExpire;
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const left = Math.max(0, deadline - Date.now());
      setMsLeft(left);
      if (left === 0 && !fired.current) {
        fired.current = true;
        expire.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [deadline, running]);

  return msLeft;
}
