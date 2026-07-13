import type { MessageFilterDto } from "$lib/api/index.schemas";
import { TableBackendFilter } from "$lib/components/table";
import type { MessageStatusValue } from "$lib/feature/message/message-view-data";

const messageFilter = new TableBackendFilter<MessageFilterDto>();

export const messageTableFilters = messageFilter.define([
  messageFilter.containment({
    filterId: "status",
    fieldId: "status",
    label: "Status",
    defaultOperator: "IN",
    backend: { mapValue: (value) => value as MessageStatusValue[] },
  }),
  messageFilter.comparison({
    filterId: "sentFrom",
    fieldId: "sentAt",
    label: "Sent from",
    defaultOperator: "GREATER_OR_EQUAL",
    backend: { mapValue: (value) => `${value}T00:00:00.000Z` },
  }),
  messageFilter.comparison({
    filterId: "sentTo",
    fieldId: "sentAt",
    label: "Sent to",
    defaultOperator: "LESS_OR_EQUAL",
    backend: { mapValue: (value) => `${value}T23:59:59.999Z` },
  }),
  messageFilter.text({
    filterId: "tenantPhoneNumber",
    fieldId: "tenantPhoneNumber",
    label: "Tenant phone",
    defaultOperator: "CONTAINS",
  }),
] as const);
