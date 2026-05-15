<script lang="ts">
  import { fade, fly } from "svelte/transition";
  import { notificationsState } from "$lib/state/notifications.svelte";
  import Notification from "../notification/Notification.svelte";
</script>

<div
  class={`
    pointer-events-none fixed top-0 left-0 z-999999 flex h-full
    w-full flex-col items-center justify-end gap-2 *:pointer-events-auto sm:gap-5 sm:p-5
  `}
>
  {#each notificationsState.notifications as notification (notification.id)}
    <div
      class="w-full sm:w-xl"
      role="status"
      onpointerenter={() => notificationsState.setPaused(true)}
      onpointerleave={() => notificationsState.setPaused(false)}
      in:fly={{ y: 20, duration: 300 }}
      out:fade={{ duration: 300 }}
    >
      <Notification
        type={notification.type}
        timeLeftPercent={(notification.timeLeft / notification.initialTime) * 100}
        onClose={() => notificationsState.remove(notification.id)}
      >
        {notification.message}
      </Notification>
    </div>
  {/each}
</div>
