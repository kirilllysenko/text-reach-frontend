import type { Messages$result } from "$houdini/artifacts/Messages";
import { accessorColumn, computedColumn, displayColumn, type ColumnDef } from "text-reach-frontend-library/components/table";
import { formatMessageDate } from "../message-display";
import { messageStatusLabelMap } from "../message-status";
import MessageInspectionCell from "./MessageInspectionCell.svelte";

export type MessageTableRow = Messages$result["messages"]["edges"][number]["node"];

function size(width: number, maxWidth = Math.max(width * 3, 640)) {
  return {
    maxWidth,
    minWidth: Math.min(width, 96),
    width,
  };
}

export function createMessageColumns(): ColumnDef<MessageTableRow>[] {
  return [
    computedColumn<MessageTableRow, unknown>({
      columnId: "sentAt",
      getValueFn: (message) => formatMessageDate(message.sentAt, "Not sent"),
      header: "Sent At",
      options: { sortable: true },
      state: { size: size(190, 360) },
    }),
    computedColumn<MessageTableRow, unknown>({
      columnId: "status",
      getValueFn: (message) => messageStatusLabelMap[message.status],
      header: "Status",
      options: { sortable: true },
      state: { size: size(130, 220) },
    }),
    accessorColumn<MessageTableRow, "tenantPhoneNumber", unknown>({
      accessorKey: "tenantPhoneNumber",
      header: "Tenant Phone",
      options: { sortable: true },
      state: { size: size(180, 300) },
    }),
    accessorColumn<MessageTableRow, "text", unknown>({
      accessorKey: "text",
      header: "Text",
      options: { sortable: true },
      state: { size: size(360, 720) },
    }),
    computedColumn<MessageTableRow, unknown>({
      columnId: "contactId",
      getValueFn: (message) => message.contact?.id ?? "",
      header: "Contact ID",
      state: { size: size(280, 520) },
    }),
    computedColumn<MessageTableRow, unknown>({
      columnId: "conversationId",
      getValueFn: (message) => message.conversation?.id ?? "",
      header: "Conversation ID",
      state: { size: size(280, 520) },
    }),
    displayColumn<MessageTableRow, unknown>({
      columnId: "actions",
      header: "",
      cell: ({ row }) => ({
        component: MessageInspectionCell,
        props: { message: row.original },
      }),
      options: {
        hideable: false,
        moveable: false,
        pinnable: false,
        resizable: false,
      },
      state: {
        size: {
          maxWidth: 104,
          minWidth: 88,
          width: 88,
        },
      },
    }),
  ] satisfies ColumnDef<MessageTableRow>[];
}
