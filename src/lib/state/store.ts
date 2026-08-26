import { createStore as createSolidStore, type Store } from "solid-js";

type StoreValue<T> = T | ((current: T) => T);

export interface StoreSetter<T extends object> {
  (value: T | Partial<T> | ((draft: T) => T | void)): void;
  <K extends keyof T>(key: K, value: StoreValue<T[K]>): void;
  <K extends keyof T>(key: K, childKey: PropertyKey, value: unknown): void;
}

export function createStore<T extends object>(initialValue: T): [Store<T>, StoreSetter<T>] {
  const [store, setStore] = createSolidStore(initialValue as never) as unknown as [
    Store<T>,
    (setter: (draft: T) => T | void) => void,
  ];

  const setValue = ((...args: unknown[]) => {
    setStore((draft) => {
      if (args.length === 1) {
        const value = args[0];
        if (typeof value === "function") return value(draft);
        Object.assign(draft, value);
        return;
      }

      const key = args[0] as keyof T;
      if (args.length === 2) {
        const value = args[1];
        draft[key] = (typeof value === "function" ? value(draft[key]) : value) as T[keyof T];
        return;
      }

      const childKey = args[1] as PropertyKey;
      const current = draft[key] as Record<PropertyKey, unknown>;
      const value = args[2];
      current[childKey] = typeof value === "function" ? value(current[childKey]) : value;
    });
  }) as StoreSetter<T>;

  return [store, setValue];
}
