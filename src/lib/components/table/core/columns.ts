import type { Component } from "svelte";
import type { DataTableFilterConfig } from "./features/filters.svelte";
import type { DotNestedKeys } from "./types";

export interface DataTableCellComponentProps<TData> {
  row: TData;
  value: unknown;
}

export interface DataTableColumnFeatureValueMap {
  visibility: boolean;
  order: number;
}

export const dataTableColumnFeatureMap = {
  visibility: true,
  order: 0,
} satisfies DataTableColumnFeatureValueMap;

export type DataTableColumnFeature = {
  [TFeature in keyof typeof dataTableColumnFeatureMap]: DataTableColumnFeatureValueMap[TFeature];
};

interface DataTableBaseColumn<TData, TMeta = unknown> {
  id: string;
  header: string;
  cell?: Component<DataTableCellComponentProps<TData>>;
  feature?: Partial<DataTableColumnFeature>;
  filter?: DataTableFilterConfig;
  filterable?: boolean;
  format?: (value: unknown, row: TData) => string;
  grow?: boolean;
  hideable?: boolean;
  maxSize?: number;
  meta?: TMeta;
  minSize?: number;
  moveable?: boolean;
  size?: number;
  sortable?: boolean;
}

export interface DataTableAccessorColumn<TData, TMeta = unknown> extends DataTableBaseColumn<TData, TMeta> {
  kind: "accessor";
  accessorKey: DotNestedKeys<TData>;
}

export interface DataTableDisplayColumn<TData, TMeta = unknown> extends DataTableBaseColumn<TData, TMeta> {
  kind: "display";
}

export type DataTableColumnDef<TData, TMeta = unknown> =
  | DataTableAccessorColumn<TData, TMeta>
  | DataTableDisplayColumn<TData, TMeta>;

export type DataTableColumn<TData, TMeta = unknown> = DataTableColumnDef<TData, TMeta> & {
  feature: DataTableColumnFeature;
};

type CreatedAccessorColumn<TPath extends string, TMeta = unknown> = Omit<
  DataTableAccessorColumn<any, TMeta>,
  "accessorKey"
> & {
  accessorKey: TPath;
};

type CreatedDisplayColumn<TMeta = unknown> = DataTableDisplayColumn<any, TMeta>;

type ColumnRow<TData> = [TData] extends [never] ? any : TData;
type AccessorKey<TData, TPath extends string> = [TData] extends [never] ? TPath : DotNestedKeys<TData>;
type AccessorColumnResult<TData, TPath extends string, TMeta> = [TData] extends [never]
  ? CreatedAccessorColumn<TPath, TMeta>
  : DataTableAccessorColumn<TData, TMeta>;
type DisplayColumnResult<TData, TMeta> = [TData] extends [never]
  ? CreatedDisplayColumn<TMeta>
  : DataTableDisplayColumn<TData, TMeta>;

type AccessorColumnProps<TData, TPath extends string, TMeta = unknown> = Omit<
  DataTableBaseColumn<ColumnRow<TData>, TMeta>,
  "header" | "id"
> & {
  accessorKey: AccessorKey<TData, TPath>;
  header?: string;
  id?: string;
};

type DisplayColumnProps<TData, TMeta = unknown> = Omit<
  DataTableBaseColumn<ColumnRow<TData>, TMeta>,
  "header" | "id"
> & {
  header?: string;
  id: string;
};

export function accessorColumn<TData = never, TMeta = unknown, const TPath extends string = string>(
  options: AccessorColumnProps<TData, TPath, TMeta>,
): AccessorColumnResult<TData, TPath, TMeta> {
  return {
    ...options,
    accessorKey: options.accessorKey,
    filterable: options.filterable ?? Boolean(options.filter),
    hideable: options.hideable ?? true,
    header: options.header ?? createColumnHeader(options.accessorKey),
    id: options.id ?? options.accessorKey,
    kind: "accessor",
    moveable: options.moveable ?? true,
    sortable: options.sortable ?? false,
  } as AccessorColumnResult<TData, TPath, TMeta>;
}

export function displayColumn<TData = never, TMeta = unknown>(
  options: DisplayColumnProps<TData, TMeta>,
): DisplayColumnResult<TData, TMeta> {
  return {
    ...options,
    filterable: false,
    hideable: options.hideable ?? true,
    header: options.header ?? createColumnHeader(options.id),
    id: options.id,
    kind: "display",
    moveable: options.moveable ?? true,
    sortable: false,
  } as DisplayColumnResult<TData, TMeta>;
}

function createColumnHeader(value: string): string {
  const leaf = value.split(".").at(-1) ?? value;
  return leaf
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getCellValue<TData, TMeta>(row: TData, column: DataTableColumnDef<TData, TMeta>): unknown {
  if (column.kind === "display") {
    return undefined;
  }

  return column.accessorKey.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object") {
      return undefined;
    }

    return (value as Record<string, unknown>)[key];
  }, row);
}

export function normalizeColumns<TData, TMeta>(
  columns: DataTableColumnDef<TData, TMeta>[],
): DataTableColumn<TData, TMeta>[] {
  return columns.map((column, index) => ({
    ...column,
    feature: {
      ...dataTableColumnFeatureMap,
      ...column.feature,
      order: column.feature?.order ?? index,
    },
    hideable: column.hideable ?? true,
    maxSize: column.maxSize ?? 480,
    minSize: column.minSize ?? 120,
    moveable: column.moveable ?? true,
    size: column.size ?? 180,
  }));
}
