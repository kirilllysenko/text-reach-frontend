import type { DataTableFilter } from "./features/filters.svelte";
import type { DataTableSort } from "./features/sorting.svelte";

export interface EventPayloadMap {
  filterChange: DataTableFilter[];

  sortChange: DataTableSort[];

  columnOrderChange: { order: string[] };
  columnVisibilityChange: { columnId: string; visible: boolean };

  loadError: { error: string };
  loadInitialStart: undefined;
  loadInitialSuccess: undefined;
  loadMoreStart: undefined;
  loadMoreSuccess: undefined;

  nearEnd: undefined;
  visibleRangeChange: { end: number; start: number };
}

type DataTableEventName = keyof EventPayloadMap;
type DataTableEventHandler<TEvent extends DataTableEventName> = (payload: EventPayloadMap[TEvent]) => void;

export class EventService {
  private readonly handlers = new Map<DataTableEventName, Set<DataTableEventHandler<DataTableEventName>>>();

  emit<TEvent extends DataTableEventName>(event: TEvent, payload: EventPayloadMap[TEvent]): void {
    this.handlers.get(event)?.forEach((handler) => handler(payload));
  }

  off<TEvent extends DataTableEventName>(event: TEvent, handler: DataTableEventHandler<TEvent>): void {
    this.handlers.get(event)?.delete(handler as DataTableEventHandler<DataTableEventName>);
  }

  on<TEvent extends DataTableEventName>(event: TEvent, handler: DataTableEventHandler<TEvent>): () => void {
    const eventHandlers = this.handlers.get(event) ?? new Set<DataTableEventHandler<DataTableEventName>>();
    eventHandlers.add(handler as DataTableEventHandler<DataTableEventName>);
    this.handlers.set(event, eventHandlers);

    return () => this.off(event, handler);
  }
}
