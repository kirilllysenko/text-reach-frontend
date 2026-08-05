import { type ContactGroupFilterInput, type ContactGroupSortByInput } from "$houdini/graphql/inputs";
import type { DataTableFilter } from "$lib/components/table";
import { contactGroupTableFilters } from "$lib/feature/contact-group/contact-group-table-filters";

interface ContactGroupRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  offset?: number;
  search: string;
  filters?: readonly DataTableFilter[];
  sort: readonly ContactGroupSortByInput[];
}

interface ContactGroupQueryVariables {
  after?: string;
  before?: string;
  filter?: ContactGroupFilterInput;
  first?: number;
  last?: number;
  offset?: number;
  sortBy: ContactGroupSortByInput[];
}

export interface ContactGroupFilterOptions {
  search: string;
  filters?: readonly DataTableFilter[];
}

export function buildContactGroupRequest(options: ContactGroupRequestOptions): ContactGroupQueryVariables {
  const cursor = readCursor(options.cursor);

  return {
    filter: buildContactGroupFilter(options),
    sortBy: [...options.sort],
    ...(cursor && options.direction === "previous"
      ? { before: cursor, last: options.pageSize }
      : { after: cursor, first: options.pageSize }),
    ...(cursor ? {} : { offset: options.offset }),
  };
}

export function buildContactGroupFilter(options: ContactGroupFilterOptions): ContactGroupFilterInput | undefined {
  const nested: ContactGroupFilterInput[] = [];
  const searchValue = options.search.trim();

  if (searchValue) {
    nested.push({
      name: {
        operator: "CONTAINS",
        value: searchValue,
      },
      nested: [],
      operator: "AND",
    });
  }

  nested.push(...contactGroupTableFilters.toDtos(options.filters ?? []));

  if (nested.length === 0) {
    return undefined;
  }

  return {
    operator: "AND",
    nested,
  };
}

function readCursor(cursor: unknown[] | null): string | undefined {
  const value = cursor?.[0];
  return typeof value === "string" ? value : undefined;
}
