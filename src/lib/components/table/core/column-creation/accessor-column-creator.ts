import type { AccessorColumn, DotNestedKeys } from "../column-types";
import { isColumnFilterable, isColumnSortable, isColumnVisible } from "./column-methods";
import { createColumnState, createDataColumnOptions } from "./column-defaults";
import type { CreateAccessorColumnProps } from "./types";
import { getNestedValue } from "./utils";

function formatAccessorKey(accessorKey: string): string {
  return accessorKey
    .split(".")
    .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
    .join(" ");
}

export function createAccessorColumn<
  TOriginalRow extends Record<string, any>,
  TKey extends DotNestedKeys<TOriginalRow>,
  TMeta,
>(props: CreateAccessorColumnProps<TOriginalRow, TKey, TMeta>): AccessorColumn<TOriginalRow, TMeta> {
  const { accessorKey, align, columnId, getValueFn, header, options, state, _meta, ...rest } = props;
  if (!accessorKey) throw new Error("accessorKey must be defined");

  return {
    type: "accessor",
    columnId: columnId ?? accessorKey,
    parentColumnId: rest.parentColumnId ?? null,
    header: header ?? columnId ?? formatAccessorKey(accessorKey),
    accessorKey,
    getValueFn: getValueFn ?? ((row: TOriginalRow) => getNestedValue(row, accessorKey)),
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
