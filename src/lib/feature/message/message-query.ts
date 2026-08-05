import type { MessageFilterInput, MessageSortByInput } from "$houdini/graphql/inputs";
import type { DataTableFilter } from "$lib/components/table";
import { messageTableFilters } from "$lib/feature/message/message-table-filters";

interface MessageRequestOptions {
  campaignId: string;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  filters: DataTableFilter[];
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

function buildMessageFilter(campaignId: string, search: string, filters: DataTableFilter[]): MessageFilterInput {
  const nested: MessageFilterInput[] = [
    {
      nested: [],
      operator: "AND",
      campaignId: {
        operator: "IN",
        value: [campaignId],
      },
    },
  ];
  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    nested.push({
      operator: "OR",
      nested: [
        {
          nested: [],
          operator: "AND",
          text: {
            operator: "CONTAINS",
            value: normalizedSearch,
          },
        },
        {
          nested: [],
          operator: "AND",
          tenantPhoneNumber: {
            operator: "CONTAINS",
            value: normalizedSearch,
          },
        },
      ],
    });
  }

  nested.push(...messageTableFilters.toDtos(filters));

  return {
    operator: "AND",
    nested,
  };
}
