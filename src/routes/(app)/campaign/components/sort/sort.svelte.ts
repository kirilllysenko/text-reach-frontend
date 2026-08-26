import type { CampaignSortInput } from "$houdini/graphql/inputs";
import { backendSortDefinition } from "text-reach-frontend-library/components/table";

const defineSort = backendSortDefinition<CampaignSortInput>();

export const campaignSortDefinitions = [
  defineSort({
    field: "createdAt",
    label: "Created Date",
    defaultDirection: "DESC",
  }),
  defineSort({ field: "name", label: "Name" }),
  defineSort({ field: "status", label: "Status" }),
  defineSort({ field: "messageCount", label: "All Messages" }),
  defineSort({ field: "sentMessageCount", label: "Sent Messages" }),
] as const;

export const initialCampaignSorts: CampaignSortInput[] = [{ createdAt: { direction: "DESC" } }];
