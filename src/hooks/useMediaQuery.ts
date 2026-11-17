import { useState, useEffect } from 'react';

/**
 * Hook que evalúa una media query CSS y reacciona a cambios de tamaño de ventana.
 * Respeta prefers-reduced-motion cuando se consulta.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mql.matches);
    mql.addEventListener('change', handler);

    return () => {
      mql.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}
