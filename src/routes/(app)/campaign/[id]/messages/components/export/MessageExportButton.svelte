<script lang="ts">
  import { ExportMessagesStore } from "$houdini";
  import type { MessageFilterInput, MessageSortByInput } from "$houdini/graphql/inputs";
  import { Button } from "$lib";
  import Download from "text-reach-frontend-library/icons/Download.svelte";
  import { notificationsState } from "text-reach-frontend-library/state/notifications.svelte";
  import { onDestroy } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import { buildMessageFilter } from "../message-filter";
  import {
    createMessageExportCsv,
    createMessageExportFilename,
    downloadMessageExport,
    type MessageExportItem,
  } from "./message-export";

  interface MessageExportSnapshot {
    campaignId: string;
    filters: MessageFilterInput[];
    search: string;
    sorts: MessageSortByInput[];
    tenantPhoneId: string | null;
  }

  interface Props {
    snapshot: MessageExportSnapshot;
  }

  let { snapshot }: Props = $props();
  let exporting = $state(false);
  let exportAbortController: AbortController | null = null;
  const messagesQuery = new ExportMessagesStore();
  const pageSize = 500;

  onDestroy(() => exportAbortController?.abort());

  async function exportMessages(): Promise<void> {
    if (exporting) {
      return;
    }

    exporting = true;
    exportAbortController = new AbortController();
    const currentSnapshot: MessageExportSnapshot = {
      campaignId: snapshot.campaignId,
      filters: [...snapshot.filters],
      search: snapshot.search,
      sorts: [...snapshot.sorts],
      tenantPhoneId: snapshot.tenantPhoneId,
    };

    try {
      const messages = await loadAllMessages(currentSnapshot, exportAbortController);
      if (messages.length === 0) {
        notificationsState.showInfo("There are no messages to export.");
        return;
      }

      downloadMessageExport(createMessageExportCsv(messages), createMessageExportFilename());
      notificationsState.showInfo("Messages exported.");
    } catch {
      if (!exportAbortController.signal.aborted) {
        notificationsState.showError("There was an error.");
      }
    } finally {
      exporting = false;
      exportAbortController = null;
    }
  }

  async function loadAllMessages(
    currentSnapshot: MessageExportSnapshot,
    abortController: AbortController,
  ): Promise<MessageExportItem[]> {
    const messages: MessageExportItem[] = [];
    const seenCursors = new SvelteSet<string>();
    const filter = buildMessageFilter(currentSnapshot);
    let after: string | undefined;

    while (true) {
      const response = await messagesQuery.fetch({
        abortController,
        variables: {
          after,
          filter,
          first: pageSize,
          sortBy: currentSnapshot.sorts,
        },
      });

      if (response.errors || !response.data) {
        throw new Error("Could not export messages.");
      }

      const result = response.data.messages;
      messages.push(...result.edges.map((edge) => edge.node));

      if (!result.pageInfo.hasNextPage) {
        return messages;
      }

      const nextCursor = result.pageInfo.endCursor;
      if (!nextCursor || seenCursors.has(nextCursor)) {
        throw new Error("Could not export messages.");
      }

      seenCursors.add(nextCursor);
      after = nextCursor;
    }
  }
</script>

<Button
  id="campaign-message-export-button"
  icon={Download}
  spinner={exporting}
  disabled={exporting}
  onclick={exportMessages}
>
  Export
</Button>
