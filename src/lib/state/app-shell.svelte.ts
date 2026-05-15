class AppShellState {
  sidebarOpened = $state(false);

  openSidebar = (): void => {
    this.sidebarOpened = true;
  };

  closeSidebar = (): void => {
    this.sidebarOpened = false;
  };
}

export const appShellState = new AppShellState();
