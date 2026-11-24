import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during server rendering and hydration, true after: for state that only exists in the browser. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/** Web storage that never throws (Safari private mode, storage disabled, quota full). */
export const safeStorage = {
  read(store: "local" | "session", key: string): string | null {
    try {
      return (store === "local" ? localStorage : sessionStorage).getItem(key);
    } catch {
      return null;
    }
  },
  write(store: "local" | "session", key: string, value: string): boolean {
    try {
      (store === "local" ? localStorage : sessionStorage).setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(store: "local" | "session", key: string): void {
    try {
      (store === "local" ? localStorage : sessionStorage).removeItem(key);
    } catch {
      // Nothing stored, nothing to remove.
    }
  },
};
