class PhoneFilterState {
  selectedPhoneId = $state<string | null>(null);

  selectPhone = (phoneId: string | null): void => {
    this.selectedPhoneId = phoneId;
  };

  reset = (): void => {
    this.selectedPhoneId = null;
  };
}

export const phoneFilterState = new PhoneFilterState();
