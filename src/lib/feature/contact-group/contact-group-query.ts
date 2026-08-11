import type { ContactGroups$input } from "$houdini/artifacts/ContactGroups";
import type { ContactGroupFilterInput, ContactGroupSortByInput } from "$houdini/graphql/inputs";
import type { DataTableCursor, DataTablePageDirection } from "$lib/components/table";

interface ContactGroupRequestOptions {
  cursor: DataTableCursor;
  direction?: DataTablePageDirection;
  filters: ContactGroupFilterInput[];
  offset?: number;
  pageSize: number;
  search: string;
  sort: ContactGroupSortByInput[];
}

export function buildContactGroupRequest(options: ContactGroupRequestOptions): ContactGroups$input {
  const cursor = typeof options.cursor?.[0] === "string" ? options.cursor[0] : undefined;
  const filters = [...options.filters];
  const search = options.search.trim();

  if (search) {
    filters.unshift({ name: { contains: search } });
  }

  return {
    filter: filters.length > 0 ? { nested: filters, operator: "AND" } : undefined,
    sortBy: options.sort,
    ...(cursor && options.direction === "previous"
      ? { before: cursor, last: options.pageSize }
      : { after: cursor, first: options.pageSize }),
    ...(cursor ? {} : { offset: options.offset }),
  };
}
