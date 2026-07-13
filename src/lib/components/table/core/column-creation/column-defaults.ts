import type { ColumnPinningState, ColumnSizeState } from "../column-types";
import { DEFAULT_NOT_DEFINED_COLUMN_SIZE } from "../defaults";

type DataColumnOptions = {
  calculateFacets: boolean;
  searchable: boolean;
  groupable: boolean;
  sortable: boolean;
  filterable: boolean;
  pinnable: boolean;
  moveable: boolean;
  hideable: boolean;
  resizable: boolean;
};

type DisplayColumnOptions = Pick<DataColumnOptions, "pinnable" | "moveable" | "hideable" | "resizable">;

export function createColumnId(columnId: string | undefined, header: string): string {
  return columnId ?? header.toLowerCase().replace(/\s+/g, "_");
}

export function createDataColumnOptions(options?: Partial<DataColumnOptions>): DataColumnOptions {
  return {
    calculateFacets: options?.calculateFacets ?? false,
    searchable: options?.searchable ?? true,
    groupable: options?.groupable ?? true,
    sortable: options?.sortable ?? true,
    filterable: options?.filterable ?? true,
    pinnable: options?.pinnable ?? true,
    moveable: options?.moveable ?? true,
    hideable: options?.hideable ?? true,
    resizable: options?.resizable ?? true,
  };
}

export function createDisplayColumnOptions(options?: Partial<DisplayColumnOptions>) {
  return {
    calculateFacets: null,
    searchable: null,
    groupable: null,
    sortable: null,
    filterable: null,
    pinnable: options?.pinnable ?? true,
    moveable: options?.moveable ?? true,
    hideable: options?.hideable ?? true,
    resizable: options?.resizable ?? true,
  };
}

export function createColumnState(state?: {
  size?: ColumnSizeState;
  visible?: boolean;
  pinning?: Partial<ColumnPinningState>;
}) {
  return {
    size: { ...(state?.size ?? DEFAULT_NOT_DEFINED_COLUMN_SIZE) },
    visible: state?.visible ?? true,
    pinning: {
      position: state?.pinning?.position ?? "none",
      offset: 0,
    },
  } as const;
}
