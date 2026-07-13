import { isGroupColumn } from "../helpers/column-guards";
import type { ColumnDef, ColumnGroup } from "../column-types";
import type { DefaultColumnConfig } from "../config";
import type { DatagridCore } from "../index.svelte";
import type { ColumnId } from "../column-types";
import { flattenColumnStructureAndClearGroups } from "../utils.svelte";
import { DEFAULT_COLUMN_SIZE } from "../defaults";

/**
 * A class responsible for processing and managing columns in a datagrid.
 * It handles operations like initialization, assigning parent column IDs,
 * grouping, pinning, and generating column hierarchies.
 */
export class ColumnProcessor<TOriginalRow> {
  datagrid: DatagridCore<TOriginalRow>;

  /**
   * Initializes a new ColumnProcessor instance.
   *
   * @param {DatagridCore<TOriginalRow>} datagrid - The datagrid instance this processor will operate on.
   */
  constructor(datagrid: DatagridCore<TOriginalRow>) {
    this.datagrid = datagrid;
  }

  /**
   * Initializes the columns by executing pre- and post-processing hooks,
   * placing group columns at the front, and enhancing column definitions with `isGroupColumn` flag.
   *
   * @param {ColumnDef<any>[]} columns - An array of column definitions to initialize.
   * @returns {ColumnDef<any>[]} The processed column definitions.
   */
  initializeColumns = (columns: ColumnDef<TOriginalRow>[]): ColumnDef<TOriginalRow>[] => {
    columns = this.datagrid.lifecycleHooks.executePreProcessColumns(columns);
    columns = this.placeGroupColumnsInFront(columns);
    return this.datagrid.lifecycleHooks.executePostProcessColumns(columns);
  };

  /**
   * Recursively assigns parent column IDs to each column in the provided list.
   *
   * @param {ColumnDef<TOriginalRow>[]} columns - The columns to process.
   * @param {ColumnId | null} parentColumnId - The parent column ID to assign to child columns.
   * @returns {ColumnDef<TOriginalRow>[]} The columns with assigned parent column IDs.
   */
  assignParentColumnIds(columns: ColumnDef<TOriginalRow>[], parentColumnId: ColumnId | null = null) {
    columns.forEach((column) => {
      if (isGroupColumn(column)) {
        const groupColumn = column as ColumnGroup<TOriginalRow>;
        this.assignParentColumnIds(groupColumn.columns, groupColumn.columnId);
      }
      column.parentColumnId = parentColumnId;
    });
    return columns;
  }

  /**
   * Places the group columns at the front of the column list based on the active grouping.
   *
   * @param {ColumnDef<any>[]} columns - The columns to reorder.
   * @returns {ColumnDef<any>[]} The columns with group columns placed at the front.
   */
  placeGroupColumnsInFront = (columns: ColumnDef<TOriginalRow>[]): ColumnDef<TOriginalRow>[] => {
    const groupByColumns = this.datagrid.features.grouping.activeGroups;

    const orderedGroupColumns = groupByColumns
      .map((groupCol: string) => columns.find((column) => column.columnId === groupCol))
      .filter((column: ColumnDef<TOriginalRow> | undefined): column is ColumnDef<TOriginalRow> => Boolean(column));

    const nonGroupColumns = columns.filter((col) => !groupByColumns.includes(col.columnId));

    return [...orderedGroupColumns, ...nonGroupColumns];
  };

  /**
   * Refreshes the column pinning offsets based on the given or default columns.
   *
   * @param {ColumnDef<any>[]} [columns] - The columns to update pinning offsets for (defaults to all columns).
   */
  refreshColumnPinningOffsets(columns?: ColumnDef<TOriginalRow>[]) {
    if (!columns) columns = flattenColumnStructureAndClearGroups(this.datagrid._columns);

    const newColumns: ColumnDef<TOriginalRow>[] = [];
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (!col) continue;

      if (col.state.pinning.position === "none") {
        col.state.pinning.offset = 0;
      } else {
        col.state.pinning.offset = this.datagrid.features.columnPinning.calculateOffset(
          columns,
          col.columnId,
          col.state.pinning.position,
        );
      }

      newColumns.push(col);
    }

    const hierarchicalColumns = this.datagrid.processors.column.createColumnHierarchy(newColumns);

    this.datagrid._columns = hierarchicalColumns;
  }

  /**
   * Creates a column hierarchy from the given flat column definitions.
   * This function organizes the columns into a tree structure where group columns are parents
   * and regular columns are their children.
   *
   * @param {ColumnDef<TOriginalRow>[]} partialFlatColumns - The flat list of columns to structure into a hierarchy.
   * @returns {ColumnDef<TOriginalRow>[]} A hierarchical column structure.
   */
  createColumnHierarchy<TRow>(flatColumns: ColumnDef<TRow>[]): ColumnDef<TRow>[] {
    const columnsById = new Map<string, ColumnDef<TRow>>();

    flatColumns.forEach((column) => {
      if (columnsById.has(column.columnId)) throw new Error(`Duplicate column ${column.columnId}`);
      columnsById.set(column.columnId, column.type === "group" ? { ...column, columns: [] } : column);
    });

    const validateParentChain = (column: ColumnDef<TRow>, ancestors = new Set<string>()): void => {
      if (ancestors.has(column.columnId)) throw new Error(`Cyclic column hierarchy at ${column.columnId}`);
      if (column.parentColumnId === null) return;

      const parent = columnsById.get(column.parentColumnId);
      if (!parent) throw new Error(`Parent column ${column.parentColumnId} not found for ${column.columnId}`);
      if (parent.type !== "group") throw new Error(`Parent column ${parent.columnId} must be a group`);

      validateParentChain(parent, new Set([...ancestors, column.columnId]));
    };

    columnsById.forEach((column) => validateParentChain(column));

    const roots: ColumnDef<TRow>[] = [];
    columnsById.forEach((column) => {
      if (column.parentColumnId === null) {
        roots.push(column);
        return;
      }

      const parent = columnsById.get(column.parentColumnId) as ColumnGroup<TRow>;
      parent.columns.push(column);
    });

    return roots;
  }

  /**
   * Calculates the column span for a given column.
   * If the column is a group column, the span is calculated based on its visible children.
   *
   * @param {ColumnDef<TOriginalRow>} col - The column to calculate the span for.
   * @returns {number} The calculated column span.
   */
  calculateColSpan(col: ColumnDef<TOriginalRow>): number {
    if (col.state.visible === false) return 0;

    if (isGroupColumn(col)) {
      const visibleChildrenSpan = col.columns.reduce((sum, child) => sum + this.calculateColSpan(child), 0);

      return visibleChildrenSpan === 0 ? 0 : visibleChildrenSpan;
    }

    return 1;
  }

  /**
   * Determines the maximum depth of a column hierarchy.
   *
   * @param {ColumnDef<TOriginalRow>[]} cols - The columns to calculate the depth for.
   * @returns {number} The maximum depth of the column hierarchy.
   */
  getMaxDepth(cols: ColumnDef<TOriginalRow>[]): number {
    return cols.reduce((max, col) => {
      if (isGroupColumn(col)) {
        return Math.max(max, this.getMaxDepth(col.columns) + 1);
      }
      return max;
    }, 0);
  }

  /**
   * Generates the header rows for the datagrid based on the column hierarchy.
   * Each header row contains columns that span across the grid, depending on their position in the hierarchy.
   *
   * @param {ColumnDef<TOriginalRow>[]} cols - The columns to generate header rows for.
   * @returns {ColumnDef<TOriginalRow>[][]} A 2D array representing the rows of the header.
   */
  generateHeaderRows(cols: ColumnDef<TOriginalRow>[]): ColumnDef<TOriginalRow>[][] {
    const depth = this.getMaxDepth(cols);
    const rows: (ColumnDef<TOriginalRow> & {
      colSpan?: number;
      colStart?: number;
      rowSpan?: number;
      rowStart?: number; // Add rowStart property
    })[][] = Array(depth + 1)
      .fill(null)
      .map(() => []);

    const processColumn = (col: ColumnDef<TOriginalRow>, level: number, colStart: number): number => {
      const colSpan = this.calculateColSpan(col);
      if (colSpan === 0) return colStart;

      let rowSpan = 1;
      let rowStart = level;

      if (!isGroupColumn(col)) {
        if (col.state.pinning?.position) {
          rowSpan = depth + 1;
          rowStart = 0; // Always start from the top for pinned columns
        } else {
          rowSpan = depth - level + 1;
        }
      }

      rows[level]!.push({
        ...col,
        colSpan,
        colStart,
        rowSpan,
        rowStart,
      });

      if (isGroupColumn(col)) {
        let currentStart = colStart;
        col.columns.forEach((child) => {
          currentStart = processColumn(child, level + 1, currentStart);
        });
        return colStart + colSpan;
      }

      return colStart + 1;
    };

    let currentStart = 0;
    cols.forEach((col) => {
      currentStart = processColumn(col, 0, currentStart);
    });

    return rows;
  }

  /**
   * Applies default size constraints to columns where not explicitly set.
   * @param columns - The list of columns to process.
   * @param config - Default column configuration.
   * @returns The updated columns with applied size constraints.
   */
  applyDefaultColumnSizes(columns: ColumnDef<TOriginalRow>[], config?: DefaultColumnConfig): ColumnDef<TOriginalRow>[] {
    return columns.map((column) => {
      const { maxWidth, minWidth, width } = column.state.size;
      column.state.size = {
        width: width === -1 ? (config?.size?.width ?? DEFAULT_COLUMN_SIZE.width) : width,
        minWidth: minWidth === -1 ? (config?.size?.minWidth ?? DEFAULT_COLUMN_SIZE.minWidth) : minWidth,
        maxWidth: maxWidth === -1 ? (config?.size?.maxWidth ?? DEFAULT_COLUMN_SIZE.maxWidth) : maxWidth,
      };
      return column;
    });
  }
}
