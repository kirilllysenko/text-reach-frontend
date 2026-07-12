import { SortDirection, type Sort } from "$lib/api/index.schemas";
import type { DataTableSort } from "$lib/components/table";

export type SortDtoField<TDto> = {
  [TKey in keyof TDto]-?: TKey extends string ? (NonNullable<TDto[TKey]> extends Sort ? TKey : never) : never;
}[keyof TDto];

export function tableSortsToDto<TSortId extends string>(
  sorts: readonly DataTableSort<TSortId>[],
): Partial<Record<TSortId, Sort>> {
  const dto: Partial<Record<TSortId, Sort>> = {};

  sorts.forEach((sort, index) => {
    dto[sort.sortId] = {
      direction: sort.direction === "ascending" ? SortDirection.ASC : SortDirection.DESC,
      order: index + 1,
    } satisfies Sort;
  });

  return dto;
}
