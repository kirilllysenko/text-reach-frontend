import type { ColumnGroup } from "../column-types";
import { DEFAULT_NOT_DEFINED_COLUMN_SIZE } from "../defaults";
import { isColumnFilterable, isColumnSortable, isColumnVisible } from "./column-methods";
import { createColumnId } from "./column-defaults";
import type { CreateGroupColumnProps } from "./types";

export function createColumnGroup<TOriginalRow, TMeta>({
  columnId,
  columns,
  header,
  _meta,
  ...rest
}: CreateGroupColumnProps<TOriginalRow, TMeta>): ColumnGroup<TOriginalRow, TMeta> {
  return {
    type: "group",
    columnId: createColumnId(columnId, header),
    parentColumnId: rest.parentColumnId ?? null,
    header,
    columns,
    options: {
      searchable: null,
      groupable: null,
      sortable: null,
      filterable: null,
      pinnable: null,
      moveable: true,
      resizable: false,
    },
    state: {
      size: { ...DEFAULT_NOT_DEFINED_COLUMN_SIZE },
      visible: null,
      pinning: { position: "none", offset: 0 },
    },
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
