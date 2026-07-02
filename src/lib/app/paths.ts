export const PATH_SIGN_IN = "/sign-in";
export const PATH_SIGN_UP = "/sign-up";
export const PATH_RESET_PASSWORD = "/reset-password";
export const PATH_DASHBOARD = "/dashboard";
export const PATH_CONTACTS = "/contacts";
export const PATH_CONTACT_ADD = "/contacts/add";
export const PATH_CUSTOM_FIELDS = "/custom-fields";
export const PATH_CUSTOM_FIELD_ADD = "/custom-fields/add";
export const PATH_GROUPS = "/groups";
export const PATH_GROUP_ADD = "/groups/add";
export const PATH_SMART_GROUPS = "/smart-groups";
export const PATH_CAMPAIGNS = "/campaigns";
export const PATH_CONVERSATIONS = "/conversations";
export const PATH_PROFILE = "/profile";

export const CONTACT_SECTION_PATHS = [PATH_CONTACTS, PATH_GROUPS, PATH_SMART_GROUPS, PATH_CUSTOM_FIELDS];

export function buildCustomFieldEditPath(id: string): string {
  return `/custom-fields/${id}/edit`;
}

export function buildContactEditPath(id: string): string {
  return `/contacts/${id}/edit`;
}

export function buildGroupEditPath(id: string): string {
  return `/groups/${id}/edit`;
}
