export const PATH_SIGN_IN = "/sign-in";
export const PATH_SIGN_UP = "/sign-up";
export const PATH_RESET_PASSWORD = "/reset-password";
export const PATH_DASHBOARD = "/dashboard";
export const PATH_CONTACT = "/contact";
export const PATH_CONTACT_ADD = "/contact/add";
export const PATH_CONTACT_GROUP = "/contact-group";
export const PATH_CONTACT_GROUP_ADD = "/contact-group/add";
export const PATH_CUSTOM_FIELD = "/custom-field";
export const PATH_CUSTOM_FIELD_ADD = "/custom-field/add";
export const PATH_SMART_GROUP = "/smart-group";
export const PATH_CAMPAIGN = "/campaign";
export const PATH_CONVERSATION = "/conversation";
export const PATH_PAYMENT = "/payment";
export const PATH_PAYMENT_TOP_UP = "/payment/top-up";
export const PATH_PAYMENT_TRANSACTION = "/payment/transaction";
export const PATH_PROFILE = "/profile";
export const PATH_USER = "/user";
export const PATH_USER_ADD = "/user/add";

export const CONTACT_SECTION_PATH = [PATH_CONTACT, PATH_CONTACT_GROUP, PATH_SMART_GROUP, PATH_CUSTOM_FIELD];

export function buildCustomFieldEditPath(id: string): string {
  return `/custom-field/${id}/edit`;
}

export function buildContactEditPath(id: string): string {
  return `/contact/${id}/edit`;
}

export function buildContactGroupEditPath(id: string): string {
  return `/contact-group/${id}/edit`;
}

export function buildCampaignMessagesPath(id: string): string {
  return `/campaign/${id}/messages`;
}

export function buildUserEditPath(id: string): string {
  return `/user/${id}/edit`;
}
