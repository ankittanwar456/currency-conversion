
'use client';

import { useState, useEffect, useCallback } from 'react';

function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        // Handle cases where the stored value is not a valid JSON string (e.g., just "USD")
        if (storedValue.startsWith('"') && storedValue.endsWith('"')) {
          return JSON.parse(storedValue);
        }
        // For array-like strings that are not valid JSON
        if (storedValue.startsWith('[') && storedValue.endsWith(']')) {
             try {
                return JSON.parse(storedValue);
            } catch (e) {
                // It might not be a valid JSON array, so return default.
                return defaultValue;
            }
        }
        // If it is not a JSON string, but a plain string, it might be the value itself for simple types.
        if (typeof defaultValue === 'string' && !storedValue.startsWith('{') && !storedValue.startsWith('[')) {
            return storedValue as unknown as T;
        }
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}" on initial state. Using default.`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
    }
  }, [key, state]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev: T) => (typeof value === 'function' ? (value as (prev: T) => T)(prev) : value));
  }, []);

  return [state, setValue];
}

export default usePersistentState;
