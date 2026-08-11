import type { MessageFilterInput, MessageSortByInput } from "$houdini/graphql/inputs";

interface MessageRequestOptions {
  campaignId: string;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  filters: MessageFilterInput[];
  pageSize: number;
  search: string;
  sort: readonly MessageSortByInput[];
}

export function buildMessageRequest(options: MessageRequestOptions) {
  const cursor = typeof options.cursor?.[0] === "string" ? options.cursor[0] : undefined;
  return {
    filter: buildMessageFilter(options.campaignId, options.search, options.filters),
    sortBy: [...options.sort],
    ...(cursor && options.direction === "previous"
      ? { before: cursor, last: options.pageSize }
      : { after: cursor, first: options.pageSize }),
  };
}

function buildMessageFilter(campaignId: string, search: string, filters: MessageFilterInput[]): MessageFilterInput {
  const nested: MessageFilterInput[] = [
    {
      campaignId: { in: [campaignId] },
    },
  ];
  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    nested.push({
      operator: "OR",
      nested: [
        {
          text: { contains: normalizedSearch },
        },
        {
          tenantPhoneNumber: { contains: normalizedSearch },
        },
      ],
    });
  }

  nested.push(...filters);

  return {
    operator: "AND",
    nested,
  };
}
