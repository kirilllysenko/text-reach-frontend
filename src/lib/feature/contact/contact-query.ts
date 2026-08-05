import type { ContactFilterInput, ContactSortByInput } from "$houdini/graphql/inputs";

interface ContactRequestOptions {
  pageSize: number;
  cursor: unknown[] | null;
  direction?: "next" | "previous";
  offset?: number;
  filters: readonly ContactFilterInput[];
  sort: readonly ContactSortByInput[];
}

export interface ContactQueryVariables {
  after?: string;
  before?: string;
  filter?: ContactFilterInput;
  first?: number;
  last?: number;
  offset?: number;
  sortBy: ContactSortByInput[];
}

export function buildContactRequest(options: ContactRequestOptions): ContactQueryVariables {
  const cursor = readCursor(options.cursor);
  return {
    filter: buildContactFilter(options.filters),
    sortBy: [...options.sort],
    ...(cursor && options.direction === "previous"
      ? { before: cursor, last: options.pageSize }
      : { after: cursor, first: options.pageSize }),
    ...(cursor ? {} : { offset: options.offset }),
  };
}

export function buildContactFilter(filters: readonly ContactFilterInput[]): ContactFilterInput | undefined {
  if (filters.length === 0) {
    return undefined;
  }

  return {
    operator: "AND",
    nested: [...filters],
  };
}

function readCursor(cursor: unknown[] | null): string | undefined {
  return typeof cursor?.[0] === "string" ? cursor[0] : undefined;
}
