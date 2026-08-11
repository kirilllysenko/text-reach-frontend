import type { DatagridCore } from "../index.svelte";
import { ColumnControlService } from "../services/column-control-service";
import { DataLoadingService } from "../services/data-loading-service";
import { EditingService } from "../services/editing-service.svelte";
import type { EventService } from "../services/event-service";
import { FilteringService } from "../services/filtering-service.svelte";
import { SearchService } from "../services/global-search-service";
import { GroupingService } from "../services/grouping-service";
import { PaginationService } from "../services/pagination-service";
import { RowService } from "../services/row-service.svelte";
import { SortingService } from "../services/sorting-service";
import type { DataTableSort } from "../features/sorting.svelte";

export class HandlersManager<TOriginalRow = any, TSort = DataTableSort> {
  readonly column: ColumnControlService;
  readonly dataLoading: DataLoadingService<TOriginalRow>;
  readonly filtering: FilteringService;
  readonly globalSearch: SearchService;
  readonly grouping: GroupingService;
  readonly pagination: PaginationService;
  readonly rows: RowService;
  readonly sorting: SortingService<TSort>;
  readonly editing: EditingService<TOriginalRow>;

  constructor(datagrid: DatagridCore<TOriginalRow, TSort>, events: EventService) {
    this.column = new ColumnControlService(datagrid, events);
    this.dataLoading = new DataLoadingService<TOriginalRow>(datagrid, events);
    this.filtering = new FilteringService(datagrid, events);
    this.globalSearch = new SearchService(datagrid, events);
    this.grouping = new GroupingService(datagrid, events);
    this.pagination = new PaginationService(datagrid, events);
    this.rows = new RowService(datagrid, events);
    this.sorting = new SortingService<TSort>(datagrid, events);
    this.editing = new EditingService<TOriginalRow>(datagrid, events);
  }
}
