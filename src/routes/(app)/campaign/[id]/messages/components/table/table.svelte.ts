import {
  DatagridCore,
  comparisonFilter,
  containmentFilter,
  sortDefinition,
  textFilter,
  type DataField,
  type DataTableLoadRequest,
  type DataTableLoadResult,
} from "$lib/components/table";
import type { CampaignMessagesState } from "$lib/feature/message/message-state.svelte";
import type { MessageViewModel } from "$lib/feature/message/message-view-data";
import { createMessageColumns } from "./column.svelte";

const PAGE_SIZE = 500;
const initialSorting = [{ sortId: "sentAt", direction: "descending" }] as const;

export function createMessageTable(state: CampaignMessagesState): DatagridCore<MessageViewModel> {
  return new DatagridCore<MessageViewModel>({
    columns: createMessageColumns(),
    data: [],
    dataFields: createMessageDataFields(),
    initialState: {
      dataLoading: {
        loader: (request) => fetchMessageRows(state, request),
      },
      filtering: {
        filterDefinitions: [
          containmentFilter({ filterId: "status", fieldId: "status", label: "Status", defaultOperator: "IN" }),
          comparisonFilter({
            filterId: "sentFrom",
            fieldId: "sentAt",
            label: "Sent from",
            defaultOperator: "GREATER_OR_EQUAL",
          }),
          comparisonFilter({
            filterId: "sentTo",
            fieldId: "sentAt",
            label: "Sent to",
            defaultOperator: "LESS_OR_EQUAL",
          }),
          textFilter({
            filterId: "tenantPhoneNumber",
            fieldId: "tenantPhoneNumber",
            label: "Tenant phone",
            defaultOperator: "CONTAINS",
          }),
        ],
      },
      pagination: {
        manual: true,
        pageSize: PAGE_SIZE,
      },
      sorting: {
        sortDefinitions: [
          sortDefinition({ sortId: "sentAt", fieldId: "sentAt", label: "Sent At", defaultDirection: "descending" }),
          sortDefinition({ sortId: "status", fieldId: "status", label: "Status" }),
          sortDefinition({
            sortId: "tenantPhoneNumber",
            fieldId: "tenantPhoneNumber",
            label: "Tenant Phone",
          }),
          sortDefinition({ sortId: "text", fieldId: "text", label: "Text" }),
        ],
        sorts: [...initialSorting],
      },
    },
    rowIdGetter: (message) => message.id,
  });
}

function fetchMessageRows(
  state: CampaignMessagesState,
  request: DataTableLoadRequest,
): Promise<DataTableLoadResult<MessageViewModel>> {
  return state.fetchRows(request);
}

function createMessageDataFields(): DataField<MessageViewModel>[] {
  return [
    {
      fieldId: "sentAt",
      getValueFn: (message) => message.sentAt,
      sortable: true,
    },
    {
      fieldId: "status",
      getValueFn: (message) => message.status,
      filterable: true,
      sortable: true,
    },
    {
      fieldId: "tenantPhoneNumber",
      getValueFn: (message) => message.tenantPhoneNumber,
      filterable: true,
      sortable: true,
    },
    {
      fieldId: "text",
      getValueFn: (message) => message.text,
      filterable: true,
      sortable: true,
    },
  ];
}
