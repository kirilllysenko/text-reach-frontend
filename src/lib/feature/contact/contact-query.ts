import {
  NestedOperator,
  PageDirection,
  type ContactFilterDto,
  type ContactSortDto,
  type PageRequestContactFilterDtoContactSortDto,
} from "$lib/api/index.schemas";

interface ContactRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  offset?: number;
  filters: readonly ContactFilterDto[];
  sort: ContactSortDto;
}

export function buildContactRequest(options: ContactRequestOptions): PageRequestContactFilterDtoContactSortDto {
  return {
    pageSize: options.pageSize,
    position: buildPosition(options),
    filter: buildContactFilter(options.filters),
    sort: options.sort,
  };
}

export function buildContactFilter(filters: readonly ContactFilterDto[]): ContactFilterDto | undefined {
  if (filters.length === 0) {
    return undefined;
  }

  return {
    operator: NestedOperator.AND,
    nested: [...filters],
  };
}

function buildPosition(options: ContactRequestOptions): PageRequestContactFilterDtoContactSortDto["position"] {
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
