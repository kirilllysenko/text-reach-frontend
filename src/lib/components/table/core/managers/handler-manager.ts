import type { DatagridCore } from "../index.svelte";
import { ColumnControlService } from "../services/column-control-service";
import { DataLoadingService } from "../services/data-loading-service";
import { EditingService } from "../services/editing-service.svelte";
import { EventService } from "../services/event-service";
import { FilteringService } from "../services/filtering-service.svelte";
import { SearchService } from "../services/global-search-service";
import { GroupingService } from "../services/grouping-service";
import { PaginationService } from "../services/pagination-service";
import { RowService } from "../services/row-service.svelte";
import { SortingService } from "../services/sorting-service";

/**
 * Manages handlers for various services within the datagrid.
 * Provides access to services for column control, filtering, global search,
 * grouping, pagination, row operations, sorting, and editing.
 *
 * @class HandlersManager
 */
export class HandlersManager<TSortId extends string = string> {
  /**
   * Service to manage column controls such as visibility, ordering, etc.
   * @readonly
   * @type {ColumnControlService}
   */
  readonly column: ColumnControlService<TSortId>;

  /**
   * Service to manage server-backed data loading.
   * @readonly
   * @type {DataLoadingService}
   */
  readonly dataLoading: DataLoadingService<any, TSortId>;

  /**
   * Service to manage filtering functionality within the datagrid.
   * @readonly
   * @type {FilteringService}
   */
  readonly filtering: FilteringService<TSortId>;

  /**
   * Service to manage global search functionality.
   * @readonly
   * @type {SearchService}
   */
  readonly globalSearch: SearchService<TSortId>;

  /**
   * Service to manage grouping functionality within the datagrid.
   * @readonly
   * @type {GroupingService}
   */
  readonly grouping: GroupingService<TSortId>;

  /**
   * Service to manage pagination functionality within the datagrid.
   * @readonly
   * @type {PaginationService}
   */
  readonly pagination: PaginationService<TSortId>;

  /**
   * Service to manage row operations such as selection, expansion, etc.
   * @readonly
   * @type {RowService}
   */
  readonly rows: RowService<TSortId>;

  /**
   * Service to manage sorting functionality within the datagrid.
   * @readonly
   * @type {SortingService}
   */
  readonly sorting: SortingService<TSortId>;

  /**
   * Service to manage editing functionality for rows within the datagrid.
   * @readonly
   * @type {EditingService}
   */
  readonly editing: EditingService<TSortId>;

  /**
   * Creates an instance of the HandlersManager, initializing all the necessary services.
   *
   * @param {DatagridCore} datagrid - The core datagrid instance to which services will be bound.
   * @param {EventService} eventService - The event service used for event-driven interactions between services.
   */
  constructor(datagrid: DatagridCore<any, any, TSortId>, eventService: EventService) {
    this.sorting = new SortingService(datagrid, eventService);
    this.dataLoading = new DataLoadingService<any, TSortId>(datagrid, eventService);
    this.column = new ColumnControlService<TSortId>(datagrid, eventService);
    this.filtering = new FilteringService<TSortId>(datagrid, eventService);
    this.globalSearch = new SearchService<TSortId>(datagrid, eventService);
    this.grouping = new GroupingService<TSortId>(datagrid, eventService);
    this.pagination = new PaginationService<TSortId>(datagrid, eventService);
    this.rows = new RowService<TSortId>(datagrid, eventService);
    this.editing = new EditingService<TSortId>(datagrid, eventService);
  }
}
