import type { DatagridCore } from "../index.svelte";
import type { EventService } from "./event-service";

export class BaseService<TOriginalRow = any> {
  constructor(
    protected datagrid: DatagridCore<TOriginalRow, any>,
    protected events: EventService,
  ) {}
}
