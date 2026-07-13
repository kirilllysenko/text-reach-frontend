import type { DataTableLoadReason, DataTableLoadResult } from "../features/data-loading.svelte";
import { BaseService } from "./base-service";

export class DataLoadingService<TOriginalRow> extends BaseService<TOriginalRow> {
  start(): void {
    this.datagrid.features.dataLoading.start();
  }

  stop(): void {
    this.datagrid.features.dataLoading.stop();
  }

  dispose(): void {
    this.datagrid.features.dataLoading.dispose();
  }

  load(reason: DataTableLoadReason = "reload"): Promise<DataTableLoadResult<TOriginalRow> | null> {
    return this.datagrid.features.dataLoading.load(reason);
  }

  reload(reason: DataTableLoadReason = "reload"): Promise<DataTableLoadResult<TOriginalRow> | null> {
    return this.datagrid.features.dataLoading.reload(reason);
  }
}
