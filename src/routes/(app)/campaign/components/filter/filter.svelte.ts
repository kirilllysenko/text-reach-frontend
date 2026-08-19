import type { CampaignFilterInput } from "$houdini/graphql/inputs";
import { backendFilterDefinition } from "text-reach-frontend-library/components/table";
import type { CampaignStatus } from "../campaign-view-data";

const campaignFilter = backendFilterDefinition<CampaignFilterInput>();

export const campaignFilterDefinitions = [
  campaignFilter.containment({
    defaultOperator: "IN",
    field: "status",
    filterId: "status",
    label: "Status",
    value: { toBackend: (value) => value as NonNullable<CampaignStatus>[] },
  }),
  campaignFilter.comparison({
    defaultOperator: "GREATER_OR_EQUAL",
    field: "createdAt",
    filterId: "createdAfter",
    label: "Created after",
    value: {
      fromBackend: (value) => value.slice(0, 10),
      toBackend: (value) => `${value}T00:00:00.000Z`,
    },
  }),
  campaignFilter.comparison({
    defaultOperator: "GREATER_OR_EQUAL",
    field: "sentMessageCount",
    filterId: "minSentMessageCount",
    label: "Min sent messages",
    value: { toBackend: (value) => Number(value) },
  }),
  campaignFilter.comparison({
    defaultOperator: "GREATER_OR_EQUAL",
    field: "messageCount",
    filterId: "minMessageCount",
    label: "Min all messages",
    value: { toBackend: (value) => Number(value) },
  }),
] as const;
