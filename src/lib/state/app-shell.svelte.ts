import { createContext } from "svelte";

export function createAppShellState() {
  const state = $state({ sidebarOpened: false });

  return {
    get sidebarOpened() {
      return state.sidebarOpened;
    },
    openSidebar(): void {
      state.sidebarOpened = true;
    },
    closeSidebar(): void {
      state.sidebarOpened = false;
    },
  };
}

export type AppShellState = ReturnType<typeof createAppShellState>;
export const [getAppShellState, setAppShellState] = createContext<AppShellState>();
