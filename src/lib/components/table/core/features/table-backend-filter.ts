import type {
  DataTableComparisonFilter,
  DataTableComparisonFilterDefinition,
  DataTableComparisonOperator,
  DataTableContainmentFilter,
  DataTableContainmentFilterDefinition,
  DataTableContainmentOperator,
  DataTableFilter,
  DataTableFilterDefinition,
  DataTableTextFilter,
  DataTableTextFilterDefinition,
  DataTableTextOperator,
} from "./column-filtering.svelte";

type DtoFieldId<TDto> = Exclude<keyof TDto, "nested" | "operator"> & string;
type Defined<TValue> = Exclude<TValue, null | undefined>;
type DtoField<TDto, TFieldId extends DtoFieldId<TDto>> = Defined<TDto[TFieldId]>;
declare const dtoDefinitionBrand: unique symbol;

type DtoDefinitionBrand<TDto> = {
  readonly [dtoDefinitionBrand]: (value: TDto) => TDto;
};

type ExactOperatorKeys<TDto, TOperator> = {
  [TFieldId in DtoFieldId<TDto>]: DtoField<TDto, TFieldId> extends { operator: infer TDtoOperator }
    ? [TDtoOperator] extends [TOperator]
      ? [TOperator] extends [TDtoOperator]
        ? TFieldId
        : never
      : never
    : never;
}[DtoFieldId<TDto>];

type ScalarTextKeys<TDto> = {
  [TFieldId in DtoFieldId<TDto>]: DtoField<TDto, TFieldId> extends string ? TFieldId : never;
}[DtoFieldId<TDto>];

type DtoConditionValue<TDto, TFieldId extends DtoFieldId<TDto>> =
  DtoField<TDto, TFieldId> extends {
    value?: infer TValue;
  }
    ? Defined<TValue>
    : never;

type DtoMode<TValue, TFilter extends DataTableFilter> = {
  mapValue?: (value: Defined<TFilter["value"]>, filter: TFilter) => TValue | undefined;
  mode?: "filter";
};

type DtoValueMode<TValue, TFilter extends DataTableFilter> = {
  mapValue?: (value: Defined<TFilter["value"]>, filter: TFilter) => TValue | undefined;
  mode: "value";
};

type DtoTextConditionDefinition<
  TDto,
  TFilterId extends string,
  TFieldId extends ExactOperatorKeys<TDto, DataTableTextOperator>,
  TOriginalRow,
> = Omit<DataTableTextFilterDefinition<TFilterId, TOriginalRow>, "fieldId"> & {
  backend?: DtoMode<DtoConditionValue<TDto, TFieldId>, DataTableTextFilter<TFilterId>>;
  fieldId: TFieldId;
} & DtoDefinitionBrand<TDto>;

type DtoTextValueDefinition<TDto, TFilterId extends string, TFieldId extends ScalarTextKeys<TDto>, TOriginalRow> = Omit<
  DataTableTextFilterDefinition<TFilterId, TOriginalRow>,
  "fieldId"
> & {
  backend: DtoValueMode<DtoField<TDto, TFieldId>, DataTableTextFilter<TFilterId>>;
  fieldId: TFieldId;
} & DtoDefinitionBrand<TDto>;

type DtoComparisonDefinition<
  TDto,
  TFilterId extends string,
  TFieldId extends ExactOperatorKeys<TDto, DataTableComparisonOperator>,
  TOriginalRow,
> = Omit<DataTableComparisonFilterDefinition<TFilterId, TOriginalRow>, "fieldId"> & {
  backend?: DtoMode<DtoConditionValue<TDto, TFieldId>, DataTableComparisonFilter<TFilterId>>;
  fieldId: TFieldId;
} & DtoDefinitionBrand<TDto>;

type DtoContainmentDefinition<
  TDto,
  TFilterId extends string,
  TFieldId extends ExactOperatorKeys<TDto, DataTableContainmentOperator>,
  TOriginalRow,
> = Omit<DataTableContainmentFilterDefinition<TFilterId, TOriginalRow>, "fieldId"> & {
  backend?: DtoMode<DtoConditionValue<TDto, TFieldId>, DataTableContainmentFilter<TFilterId>>;
  fieldId: TFieldId;
} & DtoDefinitionBrand<TDto>;

type BrandedRuntimeDtoDefinition<TDto> = RuntimeDtoDefinition & DtoDefinitionBrand<TDto>;

type RuntimeDtoDefinition = DataTableFilterDefinition & {
  backend?: {
    mapValue?: (...args: any[]) => unknown;
    mode?: "filter" | "value";
  };
  fieldId: string;
};

export class TableBackendFilter<TDto extends object> {
  text<
    const TFilterId extends string,
    const TFieldId extends ExactOperatorKeys<TDto, DataTableTextOperator>,
    TOriginalRow = any,
  >(
    definition: Omit<
      DtoTextConditionDefinition<TDto, TFilterId, TFieldId, TOriginalRow>,
      "type" | typeof dtoDefinitionBrand
    >,
  ): DtoTextConditionDefinition<TDto, TFilterId, TFieldId, TOriginalRow>;
  text<const TFilterId extends string, const TFieldId extends ScalarTextKeys<TDto>, TOriginalRow = any>(
    definition: Omit<
      DtoTextValueDefinition<TDto, TFilterId, TFieldId, TOriginalRow>,
      "type" | typeof dtoDefinitionBrand
    >,
  ): DtoTextValueDefinition<TDto, TFilterId, TFieldId, TOriginalRow>;
  text(definition: any) {
    return { ...definition, type: "text" as const } as any;
  }

  comparison<
    const TFilterId extends string,
    const TFieldId extends ExactOperatorKeys<TDto, DataTableComparisonOperator>,
    TOriginalRow = any,
  >(
    definition: Omit<
      DtoComparisonDefinition<TDto, TFilterId, TFieldId, TOriginalRow>,
      "type" | typeof dtoDefinitionBrand
    >,
  ): DtoComparisonDefinition<TDto, TFilterId, TFieldId, TOriginalRow> {
    return { ...definition, type: "comparison" } as DtoComparisonDefinition<TDto, TFilterId, TFieldId, TOriginalRow>;
  }

  containment<
    const TFilterId extends string,
    const TFieldId extends ExactOperatorKeys<TDto, DataTableContainmentOperator>,
    TOriginalRow = any,
  >(
    definition: Omit<
      DtoContainmentDefinition<TDto, TFilterId, TFieldId, TOriginalRow>,
      "type" | typeof dtoDefinitionBrand
    >,
  ): DtoContainmentDefinition<TDto, TFilterId, TFieldId, TOriginalRow> {
    return { ...definition, type: "containment" } as DtoContainmentDefinition<TDto, TFilterId, TFieldId, TOriginalRow>;
  }

  define<const TDefinitions extends readonly BrandedRuntimeDtoDefinition<TDto>[]>(
    definitions: TDefinitions,
  ): TableBackendFilterRegistry<TDto, TDefinitions> {
    return new TableBackendFilterRegistry<TDto, TDefinitions>(definitions);
  }
}

export class TableBackendFilterRegistry<TDto, TDefinitions extends readonly BrandedRuntimeDtoDefinition<TDto>[]> {
  readonly definitions: TDefinitions;
  private readonly definitionsById = new Map<string, RuntimeDtoDefinition>();

  constructor(definitions: TDefinitions) {
    this.definitions = definitions;

    definitions.forEach((definition) => {
      if (this.definitionsById.has(definition.filterId)) {
        throw new Error(`Duplicate filter definition ${definition.filterId}`);
      }

      this.definitionsById.set(definition.filterId, definition as RuntimeDtoDefinition);
    });
  }

  toDto(filter: DataTableFilter): TDto | null {
    const definition = this.definitionsById.get(filter.filterId);
    if (!definition) {
      throw new Error(`Unknown filter definition ${filter.filterId}`);
    }
    if (definition.type !== filter.type) {
      throw new Error(`Filter ${filter.filterId} must be a ${definition.type} filter`);
    }

    const normalizedValue = normalizeFilterValue(filter);
    if (typeof normalizedValue === "undefined") {
      return null;
    }

    const value = definition.backend?.mapValue ? definition.backend.mapValue(normalizedValue, filter) : normalizedValue;
    if (typeof value === "undefined") {
      return null;
    }

    if (definition.backend?.mode === "value") {
      return { [definition.fieldId]: value } as TDto;
    }

    return {
      [definition.fieldId]: {
        operator: filter.operator,
        value,
      },
    } as TDto;
  }

  toDtos(filters: readonly DataTableFilter[]): TDto[] {
    return filters.map((filter) => this.toDto(filter)).filter((filter): filter is TDto => filter !== null);
  }
}

function normalizeFilterValue(filter: DataTableFilter): DataTableFilter["value"] | undefined {
  if (filter.type === "text") {
    const value = filter.value?.trim();
    return value || undefined;
  }

  if (filter.type === "containment") {
    return filter.value.length > 0 ? filter.value : undefined;
  }

  return typeof filter.value === "undefined" || filter.value === "" ? undefined : filter.value;
}
