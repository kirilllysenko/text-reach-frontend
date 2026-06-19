import type {
  CustomFieldDtoLike,
  CustomFieldSortField,
  CustomFieldSortRule,
  CustomFieldViewModel,
} from "$lib/features/custom-fields/custom-fields-view-data";
import { customFieldTypeLabelMap } from "$lib/features/custom-fields/custom-fields-view-data";
import type { CustomFieldType } from "$lib/api/index.schemas";

export function toCustomFieldViewModel(dto: CustomFieldDtoLike, index: number): CustomFieldViewModel {
  const type = dto.type ?? "TEXT";

  return {
    id: dto.id ?? `custom-field-${index + 1}`,
    name: dto.name?.trim() || "Unnamed field",
    type,
    typeLabel: customFieldTypeLabelMap[type],
    position: dto.position ?? "",
  };
}

export function createMockCustomFields(): CustomFieldViewModel[] {
  return [
    {
      id: "mock-custom-field-1",
      name: "Lead Source",
      type: "TEXT",
      typeLabel: customFieldTypeLabelMap.TEXT,
      position: "1",
    },
    {
      id: "mock-custom-field-2",
      name: "Lifetime Value",
      type: "NUMBER",
      typeLabel: customFieldTypeLabelMap.NUMBER,
      position: "2",
    },
    {
      id: "mock-custom-field-3",
      name: "Renewal Date",
      type: "DATE",
      typeLabel: customFieldTypeLabelMap.DATE,
      position: "3",
    },
  ];
}

export function filterCustomFields(
  fields: CustomFieldViewModel[],
  search: string,
  typeFilters: CustomFieldType[],
): CustomFieldViewModel[] {
  const searchValue = search.trim().toLowerCase();

  return fields.filter((field) => {
    const searchable = [field.name, field.typeLabel, field.position].join(" ").toLowerCase();

    if (searchValue && !searchable.includes(searchValue)) {
      return false;
    }

    return !(typeFilters.length > 0 && !typeFilters.includes(field.type));
  });
}

export function sortCustomFields(
  fields: CustomFieldViewModel[],
  sortRules: CustomFieldSortRule[],
): CustomFieldViewModel[] {
  return [...fields].sort((left, right) => {
    for (const rule of sortRules) {
      const result = compareCustomField(left, right, rule.field);

      if (result !== 0) {
        return rule.direction === "ASC" ? result : -result;
      }
    }

    return left.id.localeCompare(right.id);
  });
}

function compareCustomField(
  left: CustomFieldViewModel,
  right: CustomFieldViewModel,
  field: CustomFieldSortField,
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
