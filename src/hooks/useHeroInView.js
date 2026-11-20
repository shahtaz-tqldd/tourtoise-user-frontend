import { useSyncExternalStore } from "react";

/**
 * Tiny shared flag: is the landing hero on screen? The hero writes it, the
 * header reads it to keep a single primary CTA visible at a time.
 */
let heroInView = false;
const listeners = new Set();

export const setHeroInView = (value) => {
  if (heroInView === value) return;
  heroInView = value;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const useHeroInView = () =>
  useSyncExternalStore(subscribe, () => heroInView, () => false);

export default useHeroInView;
