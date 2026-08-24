export const PATH_SIGN_IN = "/sign-in";
export const PATH_SIGN_UP = "/sign-up";
export const PATH_RESET_PASSWORD = "/reset-password";
export const PATH_TRIAL_EXPIRED = "/trial-expired";
export const PATH_ACCOUNT_SUSPENDED = "/account-suspended";
export const PATH_ACCOUNT_CLOSED = "/account-closed";
export const PATH_ACCOUNT_UNAVAILABLE = "/account-unavailable";
export const PATH_DASHBOARD = "/dashboard";
export const PATH_CONTACT = "/contact";
export const PATH_CONTACT_ADD = "/contact/add";
export const PATH_CONTACT_IMPORT = "/contact/import/upload";
export const PATH_CONTACT_IMPORT_HISTORY = "/contact/import/history";
export const PATH_CONTACT_EXPORT_HISTORY = "/contact/export/history";
export const PATH_CONTACT_GROUP = "/contact-group";
export const PATH_CONTACT_GROUP_ADD = "/contact-group/add";
export const PATH_CUSTOM_FIELD = "/custom-field";
export const PATH_CUSTOM_FIELD_ADD = "/custom-field/add";
export const PATH_SMART_GROUP = "/smart-group";
export const PATH_CAMPAIGN = "/campaign";
export const PATH_CAMPAIGN_ADD = "/campaign/add";
export const PATH_CONVERSATION = "/conversation";
export const PATH_PHONE = "/phone";
export const PATH_PHONE_BUY = "/phone/buy";
export const PATH_TEN_DLC = "/phone/10dlc";
export const PATH_TEN_DLC_BRAND = "/phone/10dlc/brand";
export const PATH_TEN_DLC_CAMPAIGN_ADD = "/phone/10dlc/campaign/add";
export const PATH_BUSINESS = "/business";
export const PATH_BUSINESS_EDIT = "/business/edit";
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
