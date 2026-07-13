export type Primitive = string | number | boolean | null | undefined;
export type CellValue = Primitive | Record<string, any> | Array<any>;
export type GetValueFn<TOriginalRow> = (row: TOriginalRow) => CellValue;
export type GetGroupValue<TOriginalRow> = (row: TOriginalRow) => CellValue;
export type FormatterFn<TOriginalRow> = (row: TOriginalRow) => CellValue;
