import { SortDirection, type CustomFieldType, type ErrorResponse } from "$lib/api/index.schemas";
import { listCustomFields } from "$lib/api/custom-field/custom-field";
import type { DataTableFilter, DataTableLoadRequest, DataTableLoadResult, DataTableSort } from "$lib/components/table";
import {
  customFieldSortFieldLabelMap,
  customFieldSortFieldOptions,
  customFieldTypeLabelMap,
  customFieldTypeOptions,
  type CustomFieldSortField,
  type CustomFieldSortRule,
  type CustomFieldViewModel,
} from "$lib/features/custom-fields/custom-fields-view-data";
import {
  createMockCustomFields,
  filterCustomFields,
  sortCustomFields,
  toCustomFieldViewModel,
} from "./custom-fields-display";

const SEARCH_DEBOUNCE_MS = 250;

export class CustomFieldsState {
  totalRows = $state(0);
  loadingError = $state<string | null>(null);

  search = $state("");
  typeFilters = $state<CustomFieldType[]>([]);
  sortRules = $state<CustomFieldSortRule[]>([
    {
      id: crypto.randomUUID(),
      field: "name",
      direction: SortDirection.ASC,
    },
  ]);

  filtersOpen = $state(false);
  sortOpen = $state(false);
  tableKey = $state(0);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private loaded = false;
  private fields = $state<CustomFieldViewModel[]>([]);

  typeOptions = customFieldTypeOptions;
  sortFieldOptions = customFieldSortFieldOptions;

  activeFilterChips = $derived.by(() => {
    const chips: string[] = [];

    if (this.typeFilters.length > 0) {
      chips.push(`Type: ${this.typeFilters.map((type) => customFieldTypeLabelMap[type]).join(", ")}`);
    }

    return chips;
  });

  activeFilterCount = $derived(this.activeFilterChips.length);

  sortChips = $derived.by(() =>
    this.sortRules.map((rule, index) => `#${index + 1} ${customFieldSortFieldLabelMap[rule.field]} ${rule.direction}`),
  );

  activeSortCount = $derived(this.sortRules.length);

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

  addSortRule = (): void => {
    const usedFields = new Set(this.sortRules.map((rule) => rule.field));
    const field = this.sortFieldOptions.find((option) => !usedFields.has(option)) ?? this.sortFieldOptions[0];

    this.sortRules = [
      ...this.sortRules,
      {
        id: crypto.randomUUID(),
        field,
        direction: SortDirection.ASC,
      },
    ];

    this.refreshTable();
  };

  removeSortRule = (ruleId: string): void => {
    const remaining = this.sortRules.filter((rule) => rule.id !== ruleId);
    this.sortRules =
      remaining.length > 0 ? remaining : [{ id: crypto.randomUUID(), field: "name", direction: SortDirection.ASC }];

    this.refreshTable();
  };

  updateSortRuleField = (ruleId: string, field: CustomFieldSortField): void => {
    this.sortRules = this.sortRules.map((rule) => (rule.id === ruleId ? { ...rule, field } : rule));
    this.refreshTable();
  };

  updateSortRuleDirection = (ruleId: string, direction: SortDirection): void => {
    this.sortRules = this.sortRules.map((rule) => (rule.id === ruleId ? { ...rule, direction } : rule));
    this.refreshTable();
  };

  clearSortRules = (): void => {
    this.sortRules = [{ id: crypto.randomUUID(), field: "name", direction: SortDirection.ASC }];
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

  fetchRows = async (request: DataTableLoadRequest): Promise<DataTableLoadResult<CustomFieldViewModel>> => {
    if (!this.loaded) {
      await this.load();
    }

    const fields = this.getFilteredFields(request.sorting, request.filters);
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
    if (!this.searchTimer) {
      return;
    }

    clearTimeout(this.searchTimer);
    this.searchTimer = null;
  };

  private scheduleRefresh(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      this.refreshTable();
    }, SEARCH_DEBOUNCE_MS);
  }

  private refreshTable(): void {
    this.tableKey += 1;
  }

  private get filteredFields(): CustomFieldViewModel[] {
    return this.getFilteredFields([], []);
  }

  private getFilteredFields(sorting: DataTableSort[], filters: DataTableFilter[]): CustomFieldViewModel[] {
    const sortableFields = new Set<CustomFieldSortField>(this.sortFieldOptions);
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

    return sortCustomFields(
      filterCustomFields(this.fields, this.search, typeFilters),
      tableSortRules.length > 0 ? tableSortRules : this.sortRules,
    );
  }

  private async load(): Promise<void> {
    try {
      const response = await listCustomFields({ credentials: "include" });

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
    this.fields = createMockCustomFields();
    this.loaded = true;
  }
}

function getCustomFieldTypeFilters(filters: DataTableFilter[]): CustomFieldType[] {
  const typeFilter = filters.find(
    (filter) => filter.type === "containment" && filter.filterId === "type" && filter.operator === "IN",
  );

  return typeFilter?.type === "containment" ? (typeFilter.value as CustomFieldType[]) : [];
}
