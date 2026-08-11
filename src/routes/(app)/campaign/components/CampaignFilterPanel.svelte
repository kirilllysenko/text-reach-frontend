<script lang="ts">
  import { FilterPanel, type FilterPanelConfig } from "$lib";
  import type { CampaignState } from "$lib/feature/campaign/campaign-state.svelte";
  import { campaignStatusOptions, statusLabelMap } from "$lib/feature/campaign/campaign-view-data";

  interface Props {
    state: CampaignState;
  }

  let { state }: Props = $props();

  const config: FilterPanelConfig = {
    title: "Active filters",
    description: "Refine the campaign feed",
    fields: [
      {
        kind: "checkbox-group",
        id: "status",
        label: "Status",
        filterId: "status",
        operator: "IN",
        options: campaignStatusOptions.map((status) => ({
          label: statusLabelMap[status],
          value: status,
        })),
      },
      {
        kind: "input-grid",
        id: "campaign-metrics",
        columns: 3,
        inputs: [
          {
            kind: "input",
            id: "createdAfter",
            label: "Created after",
            filterId: "createdAfter",
            filterType: "comparison",
            operator: "GREATER_OR_EQUAL",
            inputType: "date",
          },
          {
            kind: "input",
            id: "minSentMessageCount",
            label: "Min sent messages",
            filterId: "minSentMessageCount",
            filterType: "comparison",
            operator: "GREATER_OR_EQUAL",
            inputType: "number",
            min: "0",
            valueKind: "number",
          },
          {
            kind: "input",
            id: "minMessageCount",
            label: "Min all messages",
            filterId: "minMessageCount",
            filterType: "comparison",
            operator: "GREATER_OR_EQUAL",
            inputType: "number",
            min: "0",
            valueKind: "number",
          },
        ],
      },
    ],
  };
</script>

<FilterPanel filtering={state.filtering} {config} compact />
