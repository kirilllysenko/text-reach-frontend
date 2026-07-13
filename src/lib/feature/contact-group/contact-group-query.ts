import {
  NestedOperator,
  PageDirection,
  TextOperator,
  type ContactGroupFilterDto,
  type ContactGroupSortDto,
  type PageRequestContactGroupFilterDtoContactGroupSortDto,
} from "$lib/api/index.schemas";
import type { DataTableFilter } from "$lib/components/table";
import { contactGroupTableFilters } from "$lib/feature/contact-group/contact-group-table-filters";

interface ContactGroupRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  offset?: number;
  search: string;
  filters?: readonly DataTableFilter[];
  sort: ContactGroupSortDto;
}

export interface ContactGroupFilterOptions {
  search: string;
  filters?: readonly DataTableFilter[];
}

export function buildContactGroupRequest(
  options: ContactGroupRequestOptions,
): PageRequestContactGroupFilterDtoContactGroupSortDto {
  return {
    pageSize: options.pageSize,
    position: buildPosition(options),
    filter: buildContactGroupFilter(options),
    sort: options.sort,
  };
}

export function buildContactGroupFilter(options: ContactGroupFilterOptions): ContactGroupFilterDto | undefined {
  const nested: ContactGroupFilterDto[] = [];
  const searchValue = options.search.trim();

  if (searchValue) {
    nested.push({
      name: {
        operator: TextOperator.CONTAINS,
        value: searchValue,
      },
    });
  }

  nested.push(...contactGroupTableFilters.toDtos(options.filters ?? []));

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
