import type { ContactFilterInput, ContactSortByInput, RequestContactExportInput } from "$houdini/graphql/inputs";

export interface ContactExportSnapshot {
  filters: ContactFilterInput[];
  search: string;
  sorts: ContactSortByInput[];
}

export function buildContactExportRequest(snapshot: ContactExportSnapshot): RequestContactExportInput {
  const filters = getContactExportFilters(snapshot);

  return {
    filter: filters.length > 0 ? { operator: "AND", nested: filters } : undefined,
    format: "CSV",
    sortBy: snapshot.sorts,
  };
}

function getContactExportFilters(snapshot: ContactExportSnapshot): ContactFilterInput[] {
  const search = snapshot.search.trim();
  if (!search || snapshot.filters.some((filter) => typeof filter.filter === "string")) {
    return snapshot.filters;
  }

  return [{ filter: search }, ...snapshot.filters];
}
