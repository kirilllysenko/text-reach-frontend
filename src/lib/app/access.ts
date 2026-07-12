import {
  PATH_CAMPAIGN,
  PATH_CONTACT,
  PATH_CONTACT_GROUP,
  PATH_CONVERSATION,
  PATH_CUSTOM_FIELD,
  PATH_PAYMENT,
  PATH_PAYMENT_TOP_UP,
  PATH_SMART_GROUP,
} from "$lib/app/paths";
import { AccessGroup, type AccessGroup as AccessGroupType } from "$lib/api/index.schemas";

function normalizePathname(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

function isWriteFormPath(pathname: string, basePath: string): boolean {
  return pathname === `${basePath}/add` || new RegExp(`^${basePath}/[^/]+/edit$`).test(pathname);
}

export function resolvePageAccess(pathname: string): AccessGroupType | undefined {
  const path = normalizePathname(pathname);

  if (new RegExp(`^${PATH_CAMPAIGN}/[^/]+/messages$`).test(path)) {
    return AccessGroup.MESSAGE_READ;
  }

  if (isWriteFormPath(path, PATH_CONTACT)) {
    return AccessGroup.CONTACT_WRITE;
  }

  if (isWriteFormPath(path, PATH_CONTACT_GROUP)) {
    return AccessGroup.CONTACT_WRITE;
  }

  if (isWriteFormPath(path, PATH_CUSTOM_FIELD)) {
    return AccessGroup.CUSTOM_FIELDS_WRITE;
  }

  if (path === PATH_PAYMENT_TOP_UP) {
    return AccessGroup.BILLING_WRITE;
  }

  if (path === PATH_CONTACT || path.startsWith(`${PATH_CONTACT}/`)) {
    return AccessGroup.CONTACT_READ;
  }

  if (path === PATH_CONTACT_GROUP || path.startsWith(`${PATH_CONTACT_GROUP}/`) || path === PATH_SMART_GROUP) {
    return AccessGroup.CONTACT_READ;
  }

  if (path === PATH_CUSTOM_FIELD || path.startsWith(`${PATH_CUSTOM_FIELD}/`)) {
    return AccessGroup.CUSTOM_FIELDS_READ;
  }

  if (path === PATH_CAMPAIGN || path.startsWith(`${PATH_CAMPAIGN}/`)) {
    return AccessGroup.CAMPAIGN_READ;
  }

  if (path === PATH_CONVERSATION) {
    return AccessGroup.MESSAGE_READ;
  }

  if (path === PATH_PAYMENT || path.startsWith(`${PATH_PAYMENT}/`)) {
    return AccessGroup.BILLING_READ;
  }

  return undefined;
}
