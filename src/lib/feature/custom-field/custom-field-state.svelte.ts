import { SortDirection, type CustomFieldType, type ErrorResponse } from "$lib/api/index.schemas";
import { listCustomFields as listCustomFieldList } from "$lib/api/custom-field/custom-field";
import type { DataTableFilter, DataTableLoadRequest, DataTableLoadResult, DataTableSort } from "$lib/components/table";
import {
  customFieldSortFieldOptions,
  type CustomFieldSortField,
  type CustomFieldSortRule,
  type CustomFieldViewModel,
} from "$lib/feature/custom-field/custom-field-view-data";
import { filterCustomFieldList, sortCustomFieldList, toCustomFieldViewModel } from "./custom-field-display";

const defaultSortRules: CustomFieldSortRule[] = [
  {
    id: "name",
    field: "name",
    direction: SortDirection.ASC,
  },
];

export class CustomFieldState {
  totalRows = $state(0);
  loadingError = $state<string | null>(null);
  search = $state("");

  private loaded = false;
  private fields = $state<CustomFieldViewModel[]>([]);

  fetchRows = async (request: DataTableLoadRequest): Promise<DataTableLoadResult<CustomFieldViewModel>> => {
    if (!this.loaded) {
      await this.load();
    }

    const fields = this.getFilteredFields(request.sorts, request.filters);
    const start = Number(request.cursor?.[0] ?? 0);
    const end = start + request.limit;
    const rows = fields.slice(start, end);

    this.totalRows = fields.length;

    return {
      rows,
      nextCursor: end < fields.length ? [end] : null,
      totalRows: fields.length,
    };
  };

  private getFilteredFields(sorting: DataTableSort[], filters: DataTableFilter[]): CustomFieldViewModel[] {
    const sortableFields = new Set<CustomFieldSortField>(customFieldSortFieldOptions);
    const tableSortRules = sorting
      .filter((sort): sort is DataTableSort & { sortId: CustomFieldSortField } =>
        sortableFields.has(sort.sortId as CustomFieldSortField),
      )
      .map((sort) => ({
        id: sort.sortId,
        field: sort.sortId,
        direction: sort.direction === "ascending" ? SortDirection.ASC : SortDirection.DESC,
      }));

    const typeFilters = getCustomFieldTypeFilters(filters);

    return sortCustomFieldList(
      filterCustomFieldList(this.fields, this.search, typeFilters),
      tableSortRules.length > 0 ? tableSortRules : defaultSortRules,
    );
  }

  private async load(): Promise<void> {
    try {
      const response = await listCustomFieldList({ credentials: "include" });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        return;
      }

      this.fields = response.data.map(toCustomFieldViewModel);
      this.loadingError = null;
      this.loaded = true;
    } catch {
      this.handleResponseError();
    }
  }

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError = error?.errorDescription ?? "Could not load custom fields from API.";
    this.fields = [];
    this.loaded = true;
  }
}

function getCustomFieldTypeFilters(filters: DataTableFilter[]): CustomFieldType[] {
  const typeFilter = filters.find(
    (filter) => filter.type === "containment" && filter.filterId === "type" && filter.operator === "IN",
  );

  return typeFilter?.type === "containment" ? (typeFilter.value as CustomFieldType[]) : [];
}
