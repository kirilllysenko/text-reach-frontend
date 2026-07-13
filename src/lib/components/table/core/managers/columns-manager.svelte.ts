import type { ColumnDef, ColumnGroup, ColumnId, LeafColumn } from "../column-types";
import { isGroupColumn } from "../helpers/column-guards";
import type { DatagridCore } from "../index.svelte";
import { flattenColumnStructureAndClearGroups, flattenColumnStructurePreservingGroups } from "../utils.svelte";

type ColumnPartitions<TOriginalRow> = Record<"left" | "right" | "none", ColumnDef<TOriginalRow>[]>;

export class ColumnsManager<TOriginalRow> {
  constructor(private readonly datagrid: DatagridCore<TOriginalRow>) {}

  getColumns(): ColumnDef<TOriginalRow>[] {
    return this.datagrid._columns;
  }

  getLeafColumns(): LeafColumn<TOriginalRow>[] {
    return flattenColumnStructureAndClearGroups(this.datagrid._columns).filter(
      (column): column is LeafColumn<TOriginalRow> => column.type !== "group",
    );
  }

  getLeafColumnsInOrder(): LeafColumn<TOriginalRow>[] {
    return flattenColumnStructureAndClearGroups(this.getColumnsInOrder()).filter(
      (column): column is LeafColumn<TOriginalRow> => column.type !== "group",
    );
  }

  getColumnsInOrder(): ColumnDef<TOriginalRow>[] {
    const partitions = this.partitionColumns();
    return [
      ...partitions.left,
      ...this.datagrid.processors.column.createColumnHierarchy(partitions.none),
      ...partitions.right,
    ];
  }

  getPinnedAndCenterColumns(): {
    left: ColumnDef<TOriginalRow>[];
    center: ColumnDef<TOriginalRow>[];
    right: ColumnDef<TOriginalRow>[];
  } {
    const partitions = this.partitionColumns();
    return {
      left: partitions.left,
      center: this.datagrid.processors.column.createColumnHierarchy(partitions.none),
      right: partitions.right,
    };
  }

  getGroupColumns(): ColumnGroup<TOriginalRow>[] {
    return flattenColumnStructurePreservingGroups(this.datagrid._columns).filter(
      (column): column is ColumnGroup<TOriginalRow> => isGroupColumn(column),
    );
  }

  findColumnById(columnId: ColumnId): ColumnDef<TOriginalRow> | null {
    return (
      flattenColumnStructurePreservingGroups(this.datagrid._columns).find((column) => column.columnId === columnId) ??
      null
    );
  }

  findColumnByIdOrThrow(columnId: ColumnId): ColumnDef<TOriginalRow> {
    const column = this.findColumnById(columnId);
    if (!column) throw new Error(`Column ${columnId} not found`);
    return column;
  }

  private partitionColumns(): ColumnPartitions<TOriginalRow> {
    const activeGroups = this.datagrid.features.grouping.activeGroups;
    const columns = this.datagrid.processors.column.placeGroupColumnsInFront(
      flattenColumnStructureAndClearGroups(this.datagrid._columns),
    );

    return columns.reduce<ColumnPartitions<TOriginalRow>>(
      (partitions, column) => {
        const position = column.state.pinning.position;

        if (position === "left" || activeGroups.includes(column.columnId)) {
          partitions.left.push(column);
        } else if (position === "right" && column.type !== "group") {
          partitions.right.push(column);
        } else {
          partitions.none.push(column);
        }

        return partitions;
      },
      { left: [], right: [], none: [] },
    );
  }
}
