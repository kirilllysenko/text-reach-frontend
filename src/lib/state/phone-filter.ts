import { createSignal } from "solid-js";

export const [selectedPhoneId, setSelectedPhoneId] = createSignal<string | null>(null);

export function selectPhone(phoneId: string | null): void {
  setSelectedPhoneId(phoneId);
}

export function resetPhoneFilter(): void {
  setSelectedPhoneId(null);
}
