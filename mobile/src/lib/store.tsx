import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Plan } from './types';

interface Persisted {
  plan: Plan | null;
  savedIds: string[];
  /** Recipes added to the shopping list by hand, with the servings to buy for. */
  extraList: { recipeId: string; servings: number }[];
  checked: string[];
}

const EMPTY: Persisted = { plan: null, savedIds: [], extraList: [], checked: [] };
const STORAGE_KEY = 'forq:v1';

interface Store extends Persisted {
  ready: boolean;
  setPlan: (plan: Plan | null) => void;
  toggleSaved: (id: string) => void;
  addToList: (recipeId: string, servings: number) => void;
  toggleChecked: (key: string) => void;
  clearChecked: () => void;
  removeFromList: (recipeId: string) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(EMPTY);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        if (json) setState({ ...EMPTY, ...JSON.parse(json) });
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const store = useMemo<Store>(
    () => ({
      ...state,
      ready,
      setPlan: (plan) => setState((s) => ({ ...s, plan, checked: [] })),
      toggleSaved: (id) =>
        setState((s) => ({
          ...s,
          savedIds: s.savedIds.includes(id) ? s.savedIds.filter((x) => x !== id) : [id, ...s.savedIds],
        })),
      addToList: (recipeId, servings) =>
        setState((s) => ({
          ...s,
          extraList: [...s.extraList.filter((e) => e.recipeId !== recipeId), { recipeId, servings }],
        })),
      toggleChecked: (key) =>
        setState((s) => ({
          ...s,
          checked: s.checked.includes(key) ? s.checked.filter((k) => k !== key) : [...s.checked, key],
        })),
      clearChecked: () => setState((s) => ({ ...s, checked: [] })),
      removeFromList: (recipeId) =>
        setState((s) => ({ ...s, extraList: s.extraList.filter((e) => e.recipeId !== recipeId) })),
    }),
    [state, ready],
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
