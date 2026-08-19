import type { MessageFilterInput } from "$houdini/graphql/inputs";

export interface MessageFilterSnapshot {
  campaignId: string;
  filters: MessageFilterInput[];
  search: string;
  tenantPhoneId?: string | null;
}

export function buildMessageFilter(snapshot: MessageFilterSnapshot): MessageFilterInput {
  const nested: MessageFilterInput[] = [{ campaignId: { in: [snapshot.campaignId] } }, ...snapshot.filters];
  const normalizedSearch = snapshot.search.trim();

  if (snapshot.tenantPhoneId) {
    nested.push({ tenantPhoneId: { in: [snapshot.tenantPhoneId] } });
  }

  if (normalizedSearch) {
    nested.push({
      operator: "OR",
      nested: [{ text: { contains: normalizedSearch } }, { tenantPhoneNumber: { contains: normalizedSearch } }],
    });
  }

  return { operator: "AND", nested };
}
