import type {
  CustomFieldDtoLike,
  CustomFieldTableSort,
  CustomFieldViewModel,
} from "$lib/feature/custom-field/custom-field-view-data";
import { customFieldTypeLabelMap, defaultCustomFieldSorts } from "$lib/feature/custom-field/custom-field-view-data";
import type { CustomFieldType } from "$lib/api/index.schemas";

export function toCustomFieldViewModel(dto: CustomFieldDtoLike, index: number): CustomFieldViewModel {
  const type = dto.type ?? "TEXT";

  return {
    id: dto.id ?? `custom-field-${index + 1}`,
    name: dto.name?.trim() || "Unnamed field",
    type,
    typeLabel: customFieldTypeLabelMap[type],
  };
}

export function createMockCustomFieldList(): CustomFieldViewModel[] {
  return [
    {
      id: "mock-custom-field-1",
      name: "Lead Source",
      type: "TEXT",
      typeLabel: customFieldTypeLabelMap.TEXT,
    },
    {
      id: "mock-custom-field-2",
      name: "Lifetime Value",
      type: "NUMBER",
      typeLabel: customFieldTypeLabelMap.NUMBER,
    },
    {
      id: "mock-custom-field-3",
      name: "Renewal Date",
      type: "DATE",
      typeLabel: customFieldTypeLabelMap.DATE,
    },
  ];
}

export function filterCustomFieldList(
  fields: CustomFieldViewModel[],
  search: string,
  typeFilters: CustomFieldType[],
): CustomFieldViewModel[] {
  const searchValue = search.trim().toLowerCase();

  return fields.filter((field) => {
    const searchable = [field.name, field.typeLabel].join(" ").toLowerCase();

    if (searchValue && !searchable.includes(searchValue)) {
      return false;
    }

    return !(typeFilters.length > 0 && !typeFilters.includes(field.type));
  });
}

export function sortCustomFieldList(
  fields: CustomFieldViewModel[],
  sorting: CustomFieldTableSort[],
): CustomFieldViewModel[] {
  const appliedSorting = sorting.length > 0 ? sorting : defaultCustomFieldSorts;

  return [...fields].sort((left, right) => {
    for (const sort of appliedSorting) {
      const result = compareCustomField(left, right, sort.sortId);

      if (result !== 0) {
        return sort.direction === "ascending" ? result : -result;
      }
    }

    return left.id.localeCompare(right.id);
  });
}

function compareCustomField(
  left: CustomFieldViewModel,
  right: CustomFieldViewModel,
  field: CustomFieldTableSort["sortId"],
): number {
  if (field === "type") {
    return left.typeLabel.localeCompare(right.typeLabel, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  }

  return String(left[field] ?? "").localeCompare(String(right[field] ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
