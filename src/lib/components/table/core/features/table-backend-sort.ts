import type { DataTableSort, DataTableSortDefinition, DataTableSortDefinitionWithDefault } from "./sorting.svelte";

type Defined<TValue> = Exclude<TValue, null | undefined>;
type BackendSortFieldId<TBackendSort> = {
  [TFieldId in keyof TBackendSort & string]: Defined<TBackendSort[TFieldId]> extends {
    direction?: infer TDirection;
    order: number;
  }
    ? "ASC" | "DESC" extends Defined<TDirection>
      ? TFieldId
      : never
    : never;
}[keyof TBackendSort & string];

declare const backendSortDefinitionBrand: unique symbol;

type BackendSortDefinitionBrand<TBackendSort> = {
  readonly [backendSortDefinitionBrand]: (value: TBackendSort) => TBackendSort;
};

type BackendSortDefinition<
  TBackendSort,
  TSortId extends string,
  TFieldId extends BackendSortFieldId<TBackendSort>,
  TOriginalRow,
> = Omit<DataTableSortDefinitionWithDefault<TSortId, TOriginalRow>, "fieldId"> & {
  fieldId: TFieldId;
} & BackendSortDefinitionBrand<TBackendSort>;

type RuntimeBackendSortDefinition = DataTableSortDefinitionWithDefault & { fieldId: string };
type BrandedRuntimeBackendSortDefinition<TBackendSort> = RuntimeBackendSortDefinition &
  BackendSortDefinitionBrand<TBackendSort>;

export class TableBackendSort<TBackendSort extends object> {
  sort<const TSortId extends string, const TFieldId extends BackendSortFieldId<TBackendSort>, TOriginalRow = any>(
    definition: Omit<
      BackendSortDefinition<TBackendSort, TSortId, TFieldId, TOriginalRow>,
      "defaultDirection" | typeof backendSortDefinitionBrand
    > &
      Pick<Partial<DataTableSortDefinition<TSortId, TOriginalRow>>, "defaultDirection">,
  ): BackendSortDefinition<TBackendSort, TSortId, TFieldId, TOriginalRow> {
    return { defaultDirection: "ascending", ...definition } as BackendSortDefinition<
      TBackendSort,
      TSortId,
      TFieldId,
      TOriginalRow
    >;
  }

  define<const TDefinitions extends readonly BrandedRuntimeBackendSortDefinition<TBackendSort>[]>(
    definitions: TDefinitions,
  ): TableBackendSortRegistry<TBackendSort, TDefinitions> {
    return new TableBackendSortRegistry<TBackendSort, TDefinitions>(definitions);
  }
}

export class TableBackendSortRegistry<
  TBackendSort,
  TDefinitions extends readonly BrandedRuntimeBackendSortDefinition<TBackendSort>[],
> {
  readonly definitions: TDefinitions;
  private readonly definitionsById = new Map<string, RuntimeBackendSortDefinition>();

  constructor(definitions: TDefinitions) {
    this.definitions = definitions;

    definitions.forEach((definition) => {
      if (this.definitionsById.has(definition.sortId)) {
        throw new Error(`Duplicate sort definition ${definition.sortId}`);
      }

      this.definitionsById.set(definition.sortId, definition as RuntimeBackendSortDefinition);
    });
  }

  toBackend(sorts: readonly DataTableSort[]): TBackendSort {
    return sorts.reduce<Record<string, unknown>>((backendSort, sort, index) => {
      const definition = this.definitionsById.get(sort.sortId);
      if (!definition) {
        throw new Error(`Unknown sort definition ${sort.sortId}`);
      }

      backendSort[definition.fieldId] = {
        direction: sort.direction === "ascending" ? "ASC" : "DESC",
        order: index + 1,
      };
      return backendSort;
    }, {}) as TBackendSort;
  }
}
