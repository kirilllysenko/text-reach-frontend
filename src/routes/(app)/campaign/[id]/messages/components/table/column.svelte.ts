import { accessorColumn, type ColumnDef } from "$lib/components/table";
import type { MessageViewModel } from "$lib/feature/message/message-view-data";

function size(width: number, maxWidth = Math.max(width * 3, 640)) {
  return {
    maxWidth,
    minWidth: Math.min(width, 96),
    width,
  };
}

export function createMessageColumns(): ColumnDef<MessageViewModel>[] {
  return [
    accessorColumn<MessageViewModel, "sentAtDisplay", unknown>({
      accessorKey: "sentAtDisplay",
      columnId: "sentAt",
      header: "Sent At",
      options: { sortable: true },
      state: { size: size(190, 360) },
    }),
    accessorColumn<MessageViewModel, "statusLabel", unknown>({
      accessorKey: "statusLabel",
      columnId: "status",
      header: "Status",
      options: { sortable: true },
      state: { size: size(130, 220) },
    }),
    accessorColumn<MessageViewModel, "tenantPhoneNumber", unknown>({
      accessorKey: "tenantPhoneNumber",
      header: "Tenant Phone",
      options: { sortable: true },
      state: { size: size(180, 300) },
    }),
    accessorColumn<MessageViewModel, "text", unknown>({
      accessorKey: "text",
      header: "Text",
      options: { sortable: true },
      state: { size: size(360, 720) },
    }),
    accessorColumn<MessageViewModel, "contactId", unknown>({
      accessorKey: "contactId",
      header: "Contact ID",
      state: { size: size(280, 520) },
    }),
    accessorColumn<MessageViewModel, "conversationId", unknown>({
      accessorKey: "conversationId",
      header: "Conversation ID",
      state: { size: size(280, 520) },
    }),
  ] satisfies ColumnDef<MessageViewModel>[];
}
