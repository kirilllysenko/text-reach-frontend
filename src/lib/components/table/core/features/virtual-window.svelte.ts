import type { EventService } from "../events";
import type { DataTableFeature } from "../data-table.svelte";

export interface VirtualWindowFeatureOptions {
  height?: string;
  threshold?: number;
}

export interface VirtualWindowFeatureApi {
  virtual: VirtualWindowFeature;
}

interface VirtualWindowOptions {
  events: EventService;
  getRowCount: () => number;
  height: string;
  threshold: number;
}

export class VirtualWindowFeature {
  range = $state({ end: 0, start: 0 });

  constructor(private readonly options: VirtualWindowOptions) {}

  get height(): string {
    return this.options.height;
  }

  isNearEnd(rowCount: number): boolean {
    return rowCount > 0 && this.range.end >= rowCount - this.options.threshold;
  }

  updateRange(range: { end: number; start: number }): void {
    this.range = range;
    this.options.events.emit("visibleRangeChange", range);

    if (this.isNearEnd(this.options.getRowCount())) {
      this.options.events.emit("nearEnd", undefined);
    }
  }
}

export function virtualWindowFeature(
  options: VirtualWindowFeatureOptions = {},
): DataTableFeature<VirtualWindowFeatureApi> {
  return {
    install(table) {
      return {
        virtual: new VirtualWindowFeature({
          events: table.events,
          getRowCount: () => table.rows.loadedCount,
          height: options.height ?? "100%",
          threshold: options.threshold ?? 15,
        }),
      };
    },
  };
}
