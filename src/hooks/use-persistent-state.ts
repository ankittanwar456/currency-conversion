
'use client';

import { useState, useEffect, useCallback } from 'react';

function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const isBrowser = typeof window !== 'undefined';

  const [state, setState] = useState<T>(() => {
    if (!isBrowser) return defaultValue;
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        if (storedValue.startsWith('"') && storedValue.endsWith('"')) {
          return JSON.parse(storedValue);
        }
        if (storedValue.startsWith('[') && storedValue.endsWith(']')) {
          try {
            return JSON.parse(storedValue);
          } catch {
            return defaultValue;
          }
        }
        if (typeof defaultValue === 'string' && !storedValue.startsWith('{') && !storedValue.startsWith('[')) {
          return storedValue as unknown as T;
        }
        return JSON.parse(storedValue);
      }
    } catch {
      // Silent fallback to default on client
    }
    return defaultValue;
  });

  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Silent on write errors
    }
  }, [isBrowser, key, state]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev: T) => (typeof value === 'function' ? (value as (prev: T) => T)(prev) : value));
  }, []);

  return [state, setValue];
}

export default usePersistentState;
