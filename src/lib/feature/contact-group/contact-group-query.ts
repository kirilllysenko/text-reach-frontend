import {
  ComparisonOperator,
  NestedOperator,
  PageDirection,
  TextOperator,
  type ContactGroupFilterDto,
  type ContactGroupSortDto,
  type PageRequestContactGroupFilterDtoContactGroupSortDto,
  type Sort,
} from "$lib/api/index.schemas";
import type { ContactGroupSortRule } from "$lib/feature/contact-group/contact-group-view-data";

interface ContactGroupRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  offset?: number;
  search: string;
  minContactCount: string;
  maxContactCount: string;
  sortRules: ContactGroupSortRule[];
}

export interface ContactGroupFilterOptions {
  search: string;
  minContactCount: string;
  maxContactCount: string;
}

export function buildContactGroupRequest(
  options: ContactGroupRequestOptions,
): PageRequestContactGroupFilterDtoContactGroupSortDto {
  return {
    pageSize: options.pageSize,
    position: buildPosition(options),
    filter: buildContactGroupFilter(options),
    sort: buildContactGroupSort(options.sortRules),
  };
}

export function buildContactGroupFilter(options: ContactGroupFilterOptions): ContactGroupFilterDto | undefined {
  const nested: ContactGroupFilterDto[] = [];
  const searchValue = options.search.trim();
  const minContactTotal = Number(options.minContactCount);
  const maxContactTotal = Number(options.maxContactCount);

  if (searchValue) {
    nested.push({
      name: {
        operator: TextOperator.CONTAINS,
        value: searchValue,
      },
    });
  }

  if (options.minContactCount && !Number.isNaN(minContactTotal)) {
    nested.push({
      contactCount: {
        operator: ComparisonOperator.GREATER_OR_EQUAL,
        value: minContactTotal,
      },
    });
  }

  if (options.maxContactCount && !Number.isNaN(maxContactTotal)) {
    nested.push({
      contactCount: {
        operator: ComparisonOperator.LESS_OR_EQUAL,
        value: maxContactTotal,
      },
    });
  }

  if (nested.length === 0) {
    return undefined;
  }

  return {
    operator: NestedOperator.AND,
    nested,
  };
}

function buildPosition(
  options: ContactGroupRequestOptions,
): PageRequestContactGroupFilterDtoContactGroupSortDto["position"] {
  if (options.cursor) {
    return {
      type: "SEEK",
      cursor: options.cursor as Record<string, never>[],
      pageDirection: options.direction === "previous" ? PageDirection.PREVIOUS : PageDirection.NEXT,
    };
  }

  if (typeof options.offset === "number") {
    return {
      type: "OFFSET",
      offset: options.offset,
    };
  }

  return undefined;
}

function buildContactGroupSort(sortRules: ContactGroupSortRule[]): ContactGroupSortDto {
  return sortRules.reduce<ContactGroupSortDto>((acc, rule, index) => {
    acc[rule.field] = {
      order: index + 1,
      direction: rule.direction,
    } satisfies Sort;
    return acc;
  }, {});
}
