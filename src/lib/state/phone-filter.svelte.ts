class PhoneFilterState {
  selectedPhoneId = $state<string | null>(null);
  private listeners: Array<(phoneId: string | null) => void> = [];

  selectPhone = (phoneId: string | null): void => {
    if (phoneId === this.selectedPhoneId) {
      return;
    }

    this.selectedPhoneId = phoneId;
    for (const listener of this.listeners) {
      listener(phoneId);
    }
  };

  reset = (): void => {
    this.selectPhone(null);
  };

  subscribe = (listener: (phoneId: string | null) => void): (() => void) => {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((current) => current !== listener);
    };
  };
}

export const phoneFilterState = new PhoneFilterState();
