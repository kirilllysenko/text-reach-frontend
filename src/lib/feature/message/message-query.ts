import {
  ComparisonOperator,
  ContainmentOperator,
  NestedOperator,
  PageDirection,
  TextOperator,
  type MessageFilterDto,
  type MessageSortDto,
  type PageRequestMessageFilterDtoMessageSortDto,
  type Sort,
} from "$lib/api/index.schemas";
import type { DataTableFilter } from "$lib/components/table";
import type { MessageSortRule, MessageStatusValue } from "$lib/feature/message/message-view-data";

interface MessageRequestOptions {
  campaignId: string;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  filters: DataTableFilter[];
  pageSize: number;
  search: string;
  sortRules: MessageSortRule[];
}

export function buildMessageRequest(options: MessageRequestOptions): PageRequestMessageFilterDtoMessageSortDto {
  return {
    pageSize: options.pageSize,
    position: buildPosition(options),
    filter: buildMessageFilter(options.campaignId, options.search, options.filters),
    sort: buildMessageSort(options.sortRules),
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

  for (const filter of filters) {
    const nextFilter = toMessageFilter(filter);

    if (nextFilter) {
      nested.push(nextFilter);
    }
  }

  return {
    operator: NestedOperator.AND,
    nested,
  };
}

function buildMessageSort(sortRules: MessageSortRule[]): MessageSortDto {
  return sortRules.reduce<MessageSortDto>((acc, rule, index) => {
    acc[rule.field] = {
      order: index + 1,
      direction: rule.direction,
    } satisfies Sort;
    return acc;
  }, {});
}

function toMessageFilter(filter: DataTableFilter): MessageFilterDto | null {
  if (filter.type === "containment" && filter.filterId === "status" && filter.value.length > 0) {
    return {
      status: {
        operator: ContainmentOperator.IN,
        value: filter.value as MessageStatusValue[],
      },
    };
  }

  if (filter.type === "comparison") {
    return toComparisonFilter(filter);
  }

  if (filter.type === "text" && filter.filterId === "tenantPhoneNumber" && filter.value?.trim()) {
    return {
      tenantPhoneNumber: {
        operator: TextOperator.CONTAINS,
        value: filter.value.trim(),
      },
    };
  }

  return null;
}

function toComparisonFilter(filter: DataTableFilter & { type: "comparison" }): MessageFilterDto | null {
  if (filter.filterId === "sentFrom" && filter.value) {
    return {
      sentAt: {
        operator: ComparisonOperator.GREATER_OR_EQUAL,
        value: `${filter.value}T00:00:00.000Z`,
      },
    };
  }

  if (filter.filterId === "sentTo" && filter.value) {
    return {
      sentAt: {
        operator: ComparisonOperator.LESS_OR_EQUAL,
        value: `${filter.value}T23:59:59.999Z`,
      },
    };
  }

  return null;
}
