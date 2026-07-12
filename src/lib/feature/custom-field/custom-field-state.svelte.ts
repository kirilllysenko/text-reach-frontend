import type { CustomFieldType, ErrorResponse } from "$lib/api/index.schemas";
import { listCustomFields as listCustomFieldList } from "$lib/api/custom-field/custom-field";
import type { DataTableFilter, DataTableLoadRequest, DataTableLoadResult } from "$lib/components/table";
import {
  customFieldTypeLabelMap,
  customFieldTypeOptions,
  type CustomFieldTableSort,
  type CustomFieldViewModel,
} from "$lib/feature/custom-field/custom-field-view-data";
import { debounce } from "$lib/utils/debounce";
import {
  createMockCustomFieldList,
  filterCustomFieldList,
  sortCustomFieldList,
  toCustomFieldViewModel,
} from "./custom-field-display";

const SEARCH_DEBOUNCE_MS = 250;

export class CustomFieldState {
  totalRows = $state(0);
  loadingError = $state<string | null>(null);

  search = $state("");
  typeFilters = $state<CustomFieldType[]>([]);

  filtersOpen = $state(false);
  sortOpen = $state(false);
  tableKey = $state(0);

  private readonly scheduleRefresh = debounce(() => {
    this.refreshTable();
  }, SEARCH_DEBOUNCE_MS);
  private loaded = false;
  private fields = $state<CustomFieldViewModel[]>([]);

  typeOptions = customFieldTypeOptions;

  activeFilterChips = $derived.by(() => {
    const chips: string[] = [];

    if (this.typeFilters.length > 0) {
      chips.push(`Type: ${this.typeFilters.map((type) => customFieldTypeLabelMap[type]).join(", ")}`);
    }

    return chips;
  });

  activeFilterCount = $derived(this.activeFilterChips.length);

  updateSearch = (value: string): void => {
    this.search = value;
    this.scheduleRefresh();
  };

  toggleTypeFilter = (type: CustomFieldType): void => {
    this.typeFilters = this.typeFilters.includes(type)
      ? this.typeFilters.filter((value) => value !== type)
      : [...this.typeFilters, type];

    this.refreshTable();
  };

  clearFilters = (): void => {
    this.typeFilters = [];
    this.refreshTable();
  };

  openFilters = (): void => {
    this.filtersOpen = !this.filtersOpen;
    if (this.filtersOpen) {
      this.sortOpen = false;
    }
  };

  openSort = (): void => {
    this.sortOpen = !this.sortOpen;
    if (this.sortOpen) {
      this.filtersOpen = false;
    }
  };

  closeOverlays = (): void => {
    this.filtersOpen = false;
    this.sortOpen = false;
  };

  fetchRows = async (
    request: DataTableLoadRequest<CustomFieldTableSort["sortId"]>,
  ): Promise<DataTableLoadResult<CustomFieldViewModel>> => {
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

  dispose = (): void => {
    this.scheduleRefresh.cancel();
  };

  private refreshTable(): void {
    this.tableKey += 1;
  }

  private getFilteredFields(sorting: CustomFieldTableSort[], filters: DataTableFilter[]): CustomFieldViewModel[] {
    const typeFilters = getCustomFieldTypeFilters(filters);

    return sortCustomFieldList(filterCustomFieldList(this.fields, this.search, typeFilters), sorting);
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
    this.loadingError =
      error?.errorDescription ??
      "Could not load custom fields from API. The page is showing local preview data until the backend responds.";
    this.fields = createMockCustomFieldList();
    this.loaded = true;
  }
}

function getCustomFieldTypeFilters(filters: DataTableFilter[]): CustomFieldType[] {
  const typeFilter = filters.find(
    (filter) => filter.type === "containment" && filter.filterId === "type" && filter.operator === "IN",
  );

  return typeFilter?.type === "containment" ? (typeFilter.value as CustomFieldType[]) : [];
}
