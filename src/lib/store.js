import { useSyncExternalStore } from "react";

/** Chhota redux jaisa store (React ke useSyncExternalStore ke saath). */
export function createStore(reducer, initial, { onChange } = {}) {
  let state = initial;
  const subs = new Set();
  return {
    get: () => state,
    dispatch(action) {
      const next = reducer(state, action);
      if (Object.is(next, state)) return;
      state = next;
      onChange?.(state, action);
      subs.forEach((f) => f());
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
  };
}

/** selector ko hamesha aisi value deni chahiye jo state na badle to same rahe (number/string/array reference). */
export const useStore = (store, selector = (s) => s) =>
  useSyncExternalStore(store.subscribe, () => selector(store.get()), () => selector(store.get()));
