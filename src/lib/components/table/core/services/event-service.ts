import type { ColumnGroup, ColumnId, LeafColumn } from "../column-types";
import type { ColumnMovementDirection } from "../features/column-ordering.svelte";
import type { GridGroupRowIdentifier, GridRowIdentifier } from "../row-types";

export type OnPageChangePayload = { prevPage: number; newPage: number };

export type EventPayloadMap = {
  onColumnSort: { column: LeafColumn<any>; multisort?: boolean };
  onSortingChange: { column?: LeafColumn<any>; multisort?: boolean; sortId?: string };
  onRowPin: { rowId: GridRowIdentifier };
  onRowUnpin: { rowIdentifier: GridRowIdentifier };
  onRowSelect: { rowIdentifier: GridRowIdentifier };
  onRowDeselect: { rowIdentifier: GridRowIdentifier };
  onRowSelectionLimitExceeded: { rowIdentifier: GridRowIdentifier };
  onRowExpand: { rowIdentifier: GridRowIdentifier };
  onRowCollapse: { rowIdentifier: GridRowIdentifier };
  onRowExpansionLimitExceeded: { rowIdentifier: GridRowIdentifier };
  onPageChange: OnPageChangePayload;
  onPageSizeChange: { prevSize: number; pageSize: number };
  onGroupExpand: { groupIdentifier: GridGroupRowIdentifier };
  onGroupCollapse: { groupIdentifier: GridGroupRowIdentifier };
  onGroupExpansionLimitExceeded: { maxExpandedGroups: number };
  onActiveGroupsLimitExceeded: { maxActiveGroups: number };
  onGroupingChange: { activeGroups: ColumnId[] };
  onSearchQueryChange: { prevQuery: string; newQuery: string };
  onFilterChange: { column?: LeafColumn<any>; filterId?: string };
  onColumnResize: { column: LeafColumn<any> };
  onColumnVisibilityChange: { column: LeafColumn<any> };
  onColumnGroupCreation: { columnGroup: ColumnGroup<any> };
  onColumnGroupDeletion: { columnGroup: ColumnGroup<any> };
  onColumnPinningChange: { column: LeafColumn<any> };
  onColumnReorder: { columnId: ColumnId; direction: ColumnMovementDirection };
  onCellEdit: { prevOriginalRow: any; newOriginalRow: any; prevValue: any; newValue: any; column: LeafColumn<any> };
};

/**
 * Service for handling events, including registering event listeners, emitting events, and removing listeners.
 *
 * @template T The type of the event name, constrained to keys of `EventPayloadMap`.
 */
export class EventService {
  private listeners = new Map<keyof EventPayloadMap, ((data: any) => void)[]>();

  /**
   * Registers an event listener for the specified event.
   *
   * @param {T} event The name of the event to listen for.
   * @param {(data: EventPayloadMap[T]) => void} callback The callback function to invoke when the event is emitted.
   * @template T The type of the event, constrained to keys of `EventPayloadMap`.
   */
  on<T extends keyof EventPayloadMap>(event: T, callback: (data: EventPayloadMap[T]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  /**
   * Removes an event listener for the specified event.
   *
   * @param {T} event The name of the event to remove the listener from.
   * @param {(data: EventPayloadMap[T]) => void} callback The callback function to remove from the event listener list.
   * @template T The type of the event, constrained to keys of `EventPayloadMap`.
   */
  off<T extends keyof EventPayloadMap>(event: T, callback: (data: EventPayloadMap[T]) => void) {
    const callbacks = this.listeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emits an event with the specified data, triggering all registered listeners for that event.
   *
   * @param {T} event The name of the event to emit.
   * @param {EventPayloadMap[T]} data The data to pass to the event listeners.
   * @template T The type of the event, constrained to keys of `EventPayloadMap`.
   */
  emit<T extends keyof EventPayloadMap>(event: T, data: EventPayloadMap[T]) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }
}
