import {
  ComparisonOperator,
  ContainmentOperator,
  NestedOperator,
  PageDirection,
  TextOperator,
  type ContactFilterDto,
  type PageRequestContactFilterDtoContactSortDto,
} from "$lib/api/index.schemas";
import type { ContactTableSort } from "$lib/feature/contact/contact-sorting";
import { tableSortsToDto } from "$lib/utils/table-sort";

interface ContactRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  offset?: number;
  search: string;
  contactGroupIds: string[];
  birthdayAfter: string;
  emailContains: string;
  sorts: ContactTableSort[];
}

export interface ContactFilterOptions {
  search: string;
  contactGroupIds: string[];
  birthdayAfter: string;
  emailContains: string;
}

export function buildContactRequest(options: ContactRequestOptions): PageRequestContactFilterDtoContactSortDto {
  return {
    pageSize: options.pageSize,
    position: buildPosition(options),
    filter: buildContactFilter(options),
    sort: tableSortsToDto(options.sorts),
  };
}

export function buildContactFilter(options: ContactFilterOptions): ContactFilterDto | undefined {
  const nested: ContactFilterDto[] = [];
  const searchValue = options.search.trim();
  const emailValue = options.emailContains.trim();

  if (searchValue) {
    nested.push({
      filter: searchValue,
    });
  }

  if (options.contactGroupIds.length > 0) {
    nested.push({
      contactGroupId: {
        operator: ContainmentOperator.IN,
        value: options.contactGroupIds,
      },
    });
  }

  if (options.birthdayAfter) {
    nested.push({
      birthday: {
        operator: ComparisonOperator.GREATER_OR_EQUAL,
        value: options.birthdayAfter,
      },
    });
  }

  if (emailValue) {
    nested.push({
      email: {
        operator: TextOperator.CONTAINS,
        value: emailValue,
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
