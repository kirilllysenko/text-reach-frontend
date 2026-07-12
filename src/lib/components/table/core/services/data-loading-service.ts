import type { DataTableLoadReason, DataTableLoadResult } from "../features/data-loading.svelte";
import { BaseService } from "./base-service";

export class DataLoadingService extends BaseService {
  start(): void {
    this.datagrid.features.dataLoading.start();
  }

  stop(): void {
    this.datagrid.features.dataLoading.stop();
  }

  dispose(): void {
    this.datagrid.features.dataLoading.dispose();
  }

  load(reason: DataTableLoadReason = "reload"): Promise<DataTableLoadResult<any> | null> {
    return this.datagrid.features.dataLoading.load(reason);
  }

  reload(reason: DataTableLoadReason = "reload"): Promise<DataTableLoadResult<any> | null> {
    return this.datagrid.features.dataLoading.reload(reason);
  }
}
