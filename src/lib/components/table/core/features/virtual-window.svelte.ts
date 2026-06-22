import type { EventService } from "../events";

export interface DataTableInfiniteOptions {
  height?: string;
  threshold?: number;
}

interface VirtualWindowFeatureOptions {
  events: EventService;
  getRowCount: () => number;
  threshold: number;
}

export class VirtualWindowFeature {
  range = $state({ end: 0, start: 0 });

  constructor(private readonly options: VirtualWindowFeatureOptions) {}

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
