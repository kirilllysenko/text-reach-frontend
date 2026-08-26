<script lang="ts">
  import "./layout.css";
  import favicon from "text-reach-frontend-library/icons/favicon.svg";
  import NotificationsLayout from "$lib/components/notifications/NotificationsLayout.svelte";
  import { createNotificationsState, setNotificationsState } from "$lib/state/notifications.svelte";
  import { onNavigate } from "$app/navigation";

  let { children } = $props();
  setNotificationsState(createNotificationsState());

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>
{@render children()}
<NotificationsLayout />
