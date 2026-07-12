export type GridRowIdentifier = GridGroupRowIdentifier | GridBasicRowIdentifier;
export type GridGroupRowIdentifier = string;
export type GridBasicRowIdentifier = string | number;
export type RowPinningPosition = "top" | "bottom" | false;

export type Aggregation = {
  type: string;
  value: number;
  columnId: string;
};

export type GridGroupRow<TOriginalRow> = {
  index: string;
  identifier: GridGroupRowIdentifier;
  groupKey: string;
  groupValue: any[];
  depth: number;
  children: GridRow<TOriginalRow>[];
  aggregations: Aggregation[];
  isExpanded: () => boolean;
  isGroupRow: () => this is GridGroupRow<TOriginalRow>;
};

export type GridBasicRow<TOriginalRow> = {
  identifier: GridRowIdentifier;
  index: string;
  parentIndex: string | null;
  original: TOriginalRow;
  isExpanded: () => boolean;
  isGroupRow: () => false;
};

export type GridRow<TOriginalRow> = GridGroupRow<TOriginalRow> | GridBasicRow<TOriginalRow>;
