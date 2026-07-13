import type { DisplayColumn } from "../column-types";
import { isColumnFilterable, isColumnSortable, isColumnVisible } from "./column-methods";
import { createColumnId, createColumnState, createDisplayColumnOptions } from "./column-defaults";
import type { CreateDisplayColumnProps } from "./types";

export function createDisplayColumn<TOriginalRow extends Record<string, any>, TMeta>({
  align,
  cell,
  columnId,
  header,
  options,
  state,
  _meta,
  ...rest
}: CreateDisplayColumnProps<TOriginalRow, TMeta>): DisplayColumn<TOriginalRow, TMeta> {
  return {
    type: "display",
    columnId: createColumnId(columnId, header),
    parentColumnId: rest.parentColumnId ?? null,
    header,
    cell,
    options: createDisplayColumnOptions(options),
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
