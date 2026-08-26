import { createContext } from "svelte";

export function createPhoneFilterState() {
  const state = $state({ selectedPhoneId: null as string | null });
  const listeners = new Set<(phoneId: string | null) => void>();

  return {
    get selectedPhoneId() {
      return state.selectedPhoneId;
    },
    selectPhone(phoneId: string | null): void {
      if (state.selectedPhoneId === phoneId) return;
      state.selectedPhoneId = phoneId;
      for (const listener of listeners) listener(phoneId);
    },
    reset(): void {
      this.selectPhone(null);
    },
    subscribe(listener: (phoneId: string | null) => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export type PhoneFilterState = ReturnType<typeof createPhoneFilterState>;
export const [getPhoneFilterState, setPhoneFilterState] = createContext<PhoneFilterState>();
