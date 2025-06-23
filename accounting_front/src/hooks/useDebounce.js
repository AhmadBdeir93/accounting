import { useCallback, useRef } from 'react';

/**
 * Hook personnalisé pour créer une fonction avec debounce
 * @param {Function} callback - La fonction à exécuter après le délai
 * @param {number} delay - Le délai en millisecondes (défaut: 500ms)
 * @returns {Function} - La fonction avec debounce
 */
export const useDebounce = (callback, delay = 500) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    // Annuler le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Créer un nouveau timeout
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  // Fonction pour annuler le debounce
  const cancelDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { debouncedCallback, cancelDebounce };
}; 