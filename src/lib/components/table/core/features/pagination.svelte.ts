import type { DatagridCore } from "../index.svelte";

export type DataTableCursor = unknown[] | null;
export type DataTablePageDirection = "next" | "previous";

export interface DataTablePageRequest {
  cursor: DataTableCursor;
  direction: DataTablePageDirection;
  limit: number;
  offset?: number;
  page: number;
}

export type PageCursorMap = Record<number, DataTableCursor | undefined>;

/**
 * State configuration for the Pagination feature in the data grid.
 */
export type PaginationFeatureState = {
  /** Indicates whether the pagination is controlled manually. */
  manual: boolean;

  /** The current page number (starts at 1). */
  page: number;

  /** The cursor used to load each known page. Page 1 always starts with null. */
  pageCursors: PageCursorMap;

  /** The number of rows per page. */
  pageSize: number;

  /** Available page size options (e.g., [10, 20, 50, 100]). */
  pageSizes: number[];

  /** Cursor that can fetch the next page from the current page. */
  nextCursor: DataTableCursor;

  /** Cursor that can fetch the previous page from the current page. */
  previousCursor: DataTableCursor;

  /** The total number of pages available. */
  pageCount: number;

  /** The total number of rows across all pages. */
  totalCount: number;

  /** Whether the page number should automatically reset when the data changes. */
  autoResetPage: boolean;

  /** Callback invoked when the pagination state changes. */
  onPaginationChange(config: PaginationFeature<any>): void;
};

/**
 * Partial configuration for the Pagination feature, which may include overriding specific state properties.
 */
export type PaginationFeatureConfig = Partial<PaginationFeatureState>;

/**
 * Interface for row pinning functionality, extending PaginationFeatureState.
 */
export type IPaginationFeature = PaginationFeatureState;

/**
 * Manages pagination functionality within a data grid.
 *
 * Cursor pagination is modeled as an optimization of page navigation: page numbers
 * still drive the UI, while cursor state records how to fetch adjacent pages.
 */
export class PaginationFeature<TOriginalRow = any> implements IPaginationFeature {
  /** The instance of the data grid associated with this feature. */
  datagrid: DatagridCore<TOriginalRow>;

  /** Flag indicating whether page resets automatically. */
  autoResetPage = $state(false);

  /** Callback function to handle changes in pagination state. */
  onPaginationChange: (config: PaginationFeature<any>) => void = () => {};

  /** Flag indicating whether pagination is manual. */
  manual = $state(false);

  /** The current page number (starts at 1). */
  page = $state(1);

  /** Cursor used to load each known page. */
  pageCursors = $state<PageCursorMap>({ 1: null });

  /** The number of rows per page (default is 10). */
  pageSize = $state(10);

  /** Available options for rows per page (e.g., [10, 20, 50, 100]). */
  pageSizes = $state([10, 20, 50, 100]);

  /** Cursor that can fetch the next page from the current page. */
  nextCursor = $state<DataTableCursor>(null);

  /** Cursor that can fetch the previous page from the current page. */
  previousCursor = $state<DataTableCursor>(null);

  /** Total number of pages available. */
  pageCount = $state(0);

  /** Total count of rows across all pages. */
  totalCount = $state(0);

  /**
   * Creates an instance of the PaginationFeature class.
   * @param datagrid The data grid instance to which pagination will be applied.
   * @param config Optional configuration to initialize the feature.
   */
  constructor(datagrid: DatagridCore<TOriginalRow>, config?: PaginationFeatureConfig) {
    this.datagrid = datagrid;
    Object.assign(this, config);

    if (!Object.hasOwn(this.pageCursors, 1)) {
      this.pageCursors = { 1: null, ...this.pageCursors };
    }
  }

  /**
   * Determines if the previous page can be navigated to.
   */
  canGoToPrevPage(): boolean {
    return this.page > 1;
  }

  /**
   * Determines if the next page can be navigated to.
   */
  canGoToNextPage(): boolean {
    if (this.pageCount > 0) {
      return this.page < this.pageCount;
    }

    return this.nextCursor !== null;
  }

  /**
   * Retrieves the cursor used to load a page.
   */
  getPageCursor(page = this.page): DataTableCursor {
    return this.pageCursors[page] ?? null;
  }

  /**
   * Checks whether a cursor is known for a page.
   */
  hasPageCursor(page = this.page): boolean {
    return Object.hasOwn(this.pageCursors, page);
  }

  /**
   * Retrieves the cursor that should be used to fetch the next page.
   */
  getNextPageCursor(): DataTableCursor {
    return this.nextCursor ?? this.getPageCursor(this.page + 1);
  }

  /**
   * Retrieves the cursor that should be used to fetch the previous page.
   */
  getPreviousPageCursor(): DataTableCursor {
    return this.previousCursor ?? this.getPageCursor(this.page);
  }

  /**
   * Builds the pagination slice of a table load request for the current page.
   */
  getCurrentPageRequest(): DataTablePageRequest {
    return this.buildPageRequest(this.page, "next", this.getPageCursor());
  }

  /**
   * Builds the pagination slice of a table load request for a target page.
   */
  getPageRequest(page: number): DataTablePageRequest | null {
    const targetPage = this.clampPage(page);

    if (targetPage === this.page) {
      return this.getCurrentPageRequest();
    }

    const direction: DataTablePageDirection = targetPage > this.page ? "next" : "previous";
    const cursor =
      targetPage === this.page + 1
        ? this.getNextPageCursor()
        : targetPage === this.page - 1
          ? this.getPreviousPageCursor()
          : this.getPageCursor(targetPage);

    return this.buildPageRequest(targetPage, direction, cursor);
  }

  /**
   * Builds the pagination slice of a table load request for the next page.
   */
  getNextPageRequest(): DataTablePageRequest | null {
    if (!this.canGoToNextPage()) {
      return null;
    }

    return this.buildPageRequest(this.page + 1, "next", this.getNextPageCursor());
  }

  /**
   * Builds the pagination slice of a table load request for the previous page.
   */
  getPreviousPageRequest(): DataTablePageRequest | null {
    if (!this.canGoToPrevPage()) {
      return null;
    }

    return this.buildPageRequest(this.page - 1, "previous", this.getPreviousPageCursor());
  }

  /**
   * Builds a request for a page transition after the page state has changed.
   */
  getPageChangeRequest(prevPage: number, newPage: number): DataTablePageRequest {
    const direction: DataTablePageDirection = newPage > prevPage ? "next" : "previous";
    const cursor = direction === "previous" ? this.getPageCursor(prevPage) : this.getPageCursor(newPage);

    return this.buildPageRequest(newPage, direction, cursor);
  }

  /**
   * Records cursor boundaries returned by a page load.
   */
  registerLoadResult(
    request: Pick<DataTablePageRequest, "cursor" | "direction" | "limit" | "page"> & { offset?: number },
    result: { nextCursor: DataTableCursor; previousCursor?: DataTableCursor; totalRows: number },
  ): void {
    const page = request.page ?? this.page;
    const pageSize = request.limit || this.pageSize;
    const pageCursor = this.getResultPageCursor(page, request, result);
    const previousCursor = typeof result.previousCursor === "undefined" ? pageCursor : result.previousCursor;

    this.pageSize = pageSize;
    this.totalCount = result.totalRows;
    this.pageCount = Math.ceil(result.totalRows / pageSize);
    this.previousCursor = page > 1 ? (previousCursor ?? null) : null;
    this.nextCursor = result.nextCursor;

    if (typeof pageCursor !== "undefined") {
      this.setPageCursor(page, pageCursor);
    }

    if (result.nextCursor !== null) {
      this.setPageCursor(page + 1, result.nextCursor);
    } else {
      this.clearPageCursorsAfter(page);
    }

    this.onPaginationChange(this);
  }

  /**
   * Stores the cursor used to load a specific page.
   */
  setPageCursor(page: number, cursor: DataTableCursor): void {
    if (page < 1) {
      return;
    }

    this.pageCursors = {
      ...this.pageCursors,
      [page]: cursor,
    };
  }

  /**
   * Clears stored cursors and returns pagination to the first page.
   */
  resetCursors(): void {
    this.page = 1;
    this.previousCursor = null;
    this.nextCursor = null;
    this.pageCursors = { 1: null };
    this.onPaginationChange(this);
  }

  /**
   * Navigates to a specific page.
   * @param newPage The page number to navigate to.
   */
  goToPage(newPage: number): void {
    const targetPage = this.clampPage(newPage);

    if (targetPage === this.page) {
      return;
    }

    const prevPage = this.page;
    this.page = targetPage;
    this.updateAdjacentCursors();

    this.datagrid.events.emit("onPageChange", {
      prevPage,
      newPage: targetPage,
    });
    this.onPaginationChange(this);
  }

  /**
   * Navigates to the next page, if possible.
   */
  goToNextPage(): void {
    if (!this.canGoToNextPage()) {
      return;
    }

    this.goToPage(this.page + 1);
  }

  /**
   * Navigates to the previous page, if possible.
   */
  goToPrevPage(): void {
    if (!this.canGoToPrevPage()) {
      return;
    }

    this.goToPage(this.page - 1);
  }

  /**
   * Navigates to the first page.
   */
  goToFirstPage(): void {
    this.goToPage(1);
  }

  /**
   * Navigates to the last page.
   */
  goToLastPage(): void {
    if (this.pageCount < 1) {
      return;
    }

    this.goToPage(this.pageCount);
  }

  /**
   * Navigates to the closest valid page, ensuring it's within the range of available pages.
   */
  goToClosestPage(): void {
    this.goToPage(this.clampPage(this.page));
  }

  /**
   * Calculates the total number of pages based on the current data set and page size.
   * @param data The dataset used for pagination calculation.
   */
  getPageCount(data: Array<any>): number {
    return Math.ceil(data.length / this.pageSize);
  }

  /**
   * Updates the page size and adjusts pagination accordingly.
   * @param newSize The new page size to set.
   */
  setPageSize(newSize: number): void {
    this.datagrid.events.emit("onPageSizeChange", { prevSize: this.pageSize, pageSize: newSize });

    if (newSize === this.pageSize) {
      return;
    }

    this.pageSize = newSize;
    this.pageCount = this.getPageCount(this.datagrid.cacheManager.rows || []);
    this.resetCursors();
  }

  private clampPage(page: number): number {
    const requestedPage = Math.max(Math.trunc(page), 1);

    if (this.pageCount > 0) {
      return Math.min(requestedPage, this.pageCount);
    }

    return requestedPage;
  }

  private clearPageCursorsAfter(page: number): void {
    this.pageCursors = Object.fromEntries(
      Object.entries(this.pageCursors).filter(([pageNumber]) => Number(pageNumber) <= page),
    ) as PageCursorMap;
  }

  private buildPageRequest(
    page: number,
    direction: DataTablePageDirection,
    cursor: DataTableCursor,
  ): DataTablePageRequest {
    const offset = this.getOffsetForPage(page, cursor);

    return {
      cursor,
      direction,
      limit: this.pageSize,
      ...(typeof offset === "number" ? { offset } : {}),
      page,
    };
  }

  private getOffsetForPage(page: number, cursor: DataTableCursor): number | undefined {
    if (page <= 1 || cursor !== null || this.hasPageCursor(page)) {
      return undefined;
    }

    return (page - 1) * this.pageSize;
  }

  private getResultPageCursor(
    page: number,
    request: Pick<DataTablePageRequest, "cursor" | "direction"> & { offset?: number },
    result: { previousCursor?: DataTableCursor },
  ): DataTableCursor | undefined {
    if (typeof result.previousCursor !== "undefined") {
      return result.previousCursor;
    }

    if (page === 1) {
      return null;
    }

    if (request.direction === "previous") {
      return this.hasPageCursor(page) ? this.getPageCursor(page) : undefined;
    }

    if (typeof request.offset === "number" && request.cursor === null) {
      return undefined;
    }

    return request.cursor;
  }

  private updateAdjacentCursors(): void {
    this.previousCursor = this.page > 1 ? this.getPageCursor(this.page) : null;
    this.nextCursor = this.getPageCursor(this.page + 1);
  }
}
