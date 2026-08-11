import type { MessageFilterInput } from "$houdini/graphql/inputs";
import { backendFilterDefinition } from "$lib/components/table";
import type { MessageStatusValue } from "$lib/feature/message/message-view-data";

const messageFilter = backendFilterDefinition<MessageFilterInput>();

export const messageFilterDefinitions = [
  messageFilter.containment({
    filterId: "status",
    field: "status",
    label: "Status",
    defaultOperator: "IN",
    value: { toBackend: (value) => value as MessageStatusValue[] },
  }),
  messageFilter.comparison({
    filterId: "sentFrom",
    field: "sentAt",
    label: "Sent from",
    defaultOperator: "GREATER_OR_EQUAL",
    value: {
      fromBackend: toDateInputValue,
      toBackend: (value) => `${value}T00:00:00.000Z`,
    },
  }),
  messageFilter.comparison({
    filterId: "sentTo",
    field: "sentAt",
    label: "Sent to",
    defaultOperator: "LESS_OR_EQUAL",
    value: {
      fromBackend: toDateInputValue,
      toBackend: (value) => `${value}T23:59:59.999Z`,
    },
  }),
  messageFilter.text({
    filterId: "tenantPhoneNumber",
    field: "tenantPhoneNumber",
    label: "Tenant phone",
    defaultOperator: "CONTAINS",
  }),
] as const;

function toDateInputValue(value: string): string {
  return value.slice(0, 10);
}
