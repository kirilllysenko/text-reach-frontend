import type { ComputedColumn } from "../column-types";
import { isColumnFilterable, isColumnSortable, isColumnVisible } from "./column-methods";
import { createColumnId, createColumnState, createDataColumnOptions } from "./column-defaults";
import type { CreateComputeColumnProps } from "./types";

export function createComputedColumn<TOriginalRow extends Record<string, any>, TMeta>({
  align,
  columnId,
  getValueFn,
  header,
  options,
  state,
  _meta,
  ...rest
}: CreateComputeColumnProps<TOriginalRow, TMeta>): ComputedColumn<TOriginalRow, TMeta> {
  return {
    type: "computed",
    columnId: createColumnId(columnId, header),
    parentColumnId: rest.parentColumnId ?? null,
    header,
    getValueFn,
    options: createDataColumnOptions(options),
    state: createColumnState(state),
    align: align ?? "left",
    _meta: _meta ?? ({} as TMeta),
    ...rest,
    isVisible() {
      return isColumnVisible(this);
    },
    isSortable() {
      return isColumnSortable(this);
    },
    isFilterable() {
      return isColumnFilterable(this);
    },
  };
}
