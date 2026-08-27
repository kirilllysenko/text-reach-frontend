import type { PhoneType$options } from "$houdini/graphql/enums";

export interface AvailablePhone {
  phoneNumber: string;
  phoneType: PhoneType$options;
}

export interface SubmittedShortCodeApplication {
  id: string;
  requestedShortCode: string | null;
  shortCodeType: "RANDOM" | "VANITY";
}
