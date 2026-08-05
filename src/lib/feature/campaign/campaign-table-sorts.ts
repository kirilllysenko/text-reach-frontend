import type { CampaignSortInput } from "$houdini/graphql/inputs";
import { sortDefinition, type DataTableSort } from "$lib/components/table";

const definitions = [
  sortDefinition({
    sortId: "createdAt",
    fieldId: "createdAt",
    label: "Created Date",
    defaultDirection: "descending",
  }),
  sortDefinition({ sortId: "name", fieldId: "name", label: "Name" }),
  sortDefinition({ sortId: "status", fieldId: "status", label: "Status" }),
  sortDefinition({ sortId: "messageCount", fieldId: "messageCount", label: "All Messages" }),
  sortDefinition({ sortId: "sentMessageCount", fieldId: "sentMessageCount", label: "Sent Messages" }),
] as const;

export const campaignTableSorts = {
  definitions,
  toBackend(sorts: readonly DataTableSort[]): CampaignSortInput[] {
    return sorts.map((sort) => ({
      [sort.sortId]: { direction: sort.direction === "ascending" ? "ASC" : "DESC" },
    }));
  },
};
