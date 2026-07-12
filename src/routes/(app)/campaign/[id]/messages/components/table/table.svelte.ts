import {
  comparisonFilter,
  containmentFilter,
  textFilter,
  createDatagrid,
  type DataField,
  type DataTableLoadRequest,
  type DataTableLoadResult,
} from "$lib/components/table";
import type { CampaignMessagesState } from "$lib/feature/message/message-state.svelte";
import {
  defaultMessageSorts,
  messageSortDefinitions,
  type MessageSortId,
  type MessageViewModel,
} from "$lib/feature/message/message-view-data";
import { createMessageColumns } from "./column.svelte";

const PAGE_SIZE = 500;
const createMessageDatagrid = createDatagrid<MessageViewModel>();

export function createMessageTable(state: CampaignMessagesState) {
  return createMessageDatagrid({
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
        sortDefinitions: messageSortDefinitions,
        sorts: [...defaultMessageSorts],
      },
    },
    rowIdGetter: (message) => message.id,
  });
}

function fetchMessageRows(
  state: CampaignMessagesState,
  request: DataTableLoadRequest<MessageSortId>,
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
