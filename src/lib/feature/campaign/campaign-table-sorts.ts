import type { CampaignSortDto } from "$lib/api/index.schemas";
import { TableBackendSort } from "$lib/components/table";

const campaignSort = new TableBackendSort<CampaignSortDto>();

export const campaignTableSorts = campaignSort.define([
  campaignSort.sort({
    sortId: "createdAt",
    fieldId: "createdAt",
    label: "Created Date",
    defaultDirection: "descending",
  }),
  campaignSort.sort({ sortId: "name", fieldId: "name", label: "Name" }),
  campaignSort.sort({ sortId: "status", fieldId: "status", label: "Status" }),
  campaignSort.sort({ sortId: "messageCount", fieldId: "messageCount", label: "All Messages" }),
  campaignSort.sort({ sortId: "sentMessageCount", fieldId: "sentMessageCount", label: "Sent Messages" }),
] as const);
