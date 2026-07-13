import {
  ContainmentOperator,
  NestedOperator,
  PageDirection,
  TextOperator,
  type MessageFilterDto,
  type MessageSortDto,
  type PageRequestMessageFilterDtoMessageSortDto,
} from "$lib/api/index.schemas";
import type { DataTableFilter } from "$lib/components/table";
import { messageTableFilters } from "$lib/feature/message/message-table-filters";

interface MessageRequestOptions {
  campaignId: string;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  filters: DataTableFilter[];
  pageSize: number;
  search: string;
  sort: MessageSortDto;
}

export function buildMessageRequest(options: MessageRequestOptions): PageRequestMessageFilterDtoMessageSortDto {
  return {
    pageSize: options.pageSize,
    position: buildPosition(options),
    filter: buildMessageFilter(options.campaignId, options.search, options.filters),
    sort: options.sort,
  };
}

function buildPosition(options: MessageRequestOptions): PageRequestMessageFilterDtoMessageSortDto["position"] {
  if (!options.cursor) {
    return undefined;
  }

  return {
    type: "SEEK",
    cursor: options.cursor as Record<string, never>[],
    pageDirection: options.direction === "previous" ? PageDirection.PREVIOUS : PageDirection.NEXT,
  };
}

function buildMessageFilter(campaignId: string, search: string, filters: DataTableFilter[]): MessageFilterDto {
  const nested: MessageFilterDto[] = [
    {
      campaignId: {
        operator: ContainmentOperator.IN,
        value: [campaignId],
      },
    },
  ];
  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    nested.push({
      operator: NestedOperator.OR,
      nested: [
        {
          text: {
            operator: TextOperator.CONTAINS,
            value: normalizedSearch,
          },
        },
        {
          tenantPhoneNumber: {
            operator: TextOperator.CONTAINS,
            value: normalizedSearch,
          },
        },
      ],
    });
  }

  nested.push(...messageTableFilters.toDtos(filters));

  return {
    operator: NestedOperator.AND,
    nested,
  };
}
