import type { ContactGroupSortDto, ErrorResponse } from "$lib/api/index.schemas";
import { fetchContactGroups as fetchContactGroupList } from "$lib/api/contact-group/contact-group";
import type { DataTableLoadRequest, DataTableLoadResult } from "$lib/components/table";
import type { ContactGroupViewModel } from "$lib/feature/contact-group/contact-group-view-data";
import { toContactGroupViewModel } from "./contact-group-display";
import { buildContactGroupRequest } from "./contact-group-query";

export class ContactGroupState {
  totalRows = $state(0);
  loadingError = $state<string | null>(null);
  search = $state("");

  private loadedRowEstimate = 0;

  fetchRows = async (
    request: DataTableLoadRequest,
    sort: ContactGroupSortDto,
  ): Promise<DataTableLoadResult<ContactGroupViewModel>> => {
    const pageRequest = buildContactGroupRequest({
      pageSize: request.limit,
      cursor: request.cursor,
      direction: "next",
      search: this.search,
      filters: request.filters,
      sort,
    });

    try {
      const response = await fetchContactGroupList(pageRequest, { credentials: "include", signal: request.signal });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        return this.emptyRows();
      }

      const rows = (response.data.items ?? []).map((item, index) => toContactGroupViewModel(item, index));

      this.loadingError = null;
      this.updateTotalRows(
        request.limit,
        request.cursor === null,
        rows.length,
        Boolean(response.data.nextCursor),
        response.data.size,
      );

      return {
        rows,
        nextCursor: response.data.nextCursor ?? null,
        totalRows: this.totalRows,
      };
    } catch {
      this.handleResponseError();
      return this.emptyRows();
    }
  };

  private emptyRows(): DataTableLoadResult<ContactGroupViewModel> {
    this.loadedRowEstimate = 0;
    this.totalRows = 0;
    return {
      rows: [],
      nextCursor: null,
      totalRows: 0,
    };
  }

  private updateTotalRows(
    limit: number,
    isInitial: boolean,
    rowsLength: number,
    hasNextCursor: boolean,
    responseSize: number,
  ): void {
    if (isInitial) {
      this.loadedRowEstimate = rowsLength;
    } else {
      this.loadedRowEstimate += rowsLength;
    }

    const knownRows = Math.max(responseSize, this.loadedRowEstimate);
    this.totalRows = hasNextCursor ? Math.max(knownRows + limit, limit) : knownRows;
  }

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError = error?.errorDescription ?? "Could not load contact groups from API.";
  }
}
