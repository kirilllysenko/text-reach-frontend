<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import Notification from '../notification/Notification.svelte';

  interface NotificationData {
    id: string;
    message: string;
    type: 'info' | 'error';
    initialTime: number;
    timeLeft: number;
  }

  const UPDATE_INTERVAL = 100;
  const SHOW_DURATION = 10_000;

  let notifications = $state<NotificationData[]>([]);
  let paused = $state(false);
  const intervals = new SvelteMap<string, ReturnType<typeof setInterval>>();

  function show(message: string, type: 'info' | 'error'): void {
    const existingMessage = notifications.find((value) => value.message === message);
    if (existingMessage) {
      existingMessage.timeLeft = SHOW_DURATION;
      return;
    }

    const msg: NotificationData = {
      id: crypto.randomUUID(),
      message,
      type,
      initialTime: SHOW_DURATION,
      timeLeft: SHOW_DURATION
    };

    notifications = [msg, ...notifications];

    const intervalId = setInterval(() => {
      if (paused) return;

      msg.timeLeft -= UPDATE_INTERVAL;
      if (msg.timeLeft <= 0) {
        clearInterval(intervalId);
        intervals.delete(msg.id);
        remove(msg.id);
      }
    }, UPDATE_INTERVAL);

    intervals.set(msg.id, intervalId);
  }

  export function showInfo(message: string): void {
    show(message, 'info');
  }

  export function showError(message: string): void {
    show(message, 'error');
  }

  function remove(id: string): void {
    const intervalId = intervals.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      intervals.delete(id);
    }

    notifications = notifications.filter((it) => it.id !== id);
    paused = false;
  }

  onDestroy(() => {
    for (const intervalId of intervals.values()) {
      clearInterval(intervalId);
    }
    intervals.clear();
  });
</script>

<div
  class={`
    fixed w-full h-full left-0 top-0 pointer-events-none *:pointer-events-auto
    flex flex-col gap-2 sm:gap-5 sm:p-5 justify-end items-center z-999999
  `}
>
  {#each notifications as notification (notification.id)}
    <div
      class="w-full sm:w-xl"
      role="status"
      onpointerenter={() => (paused = true)}
      onpointerleave={() => (paused = false)}
      in:fly={{ y: 20, duration: 300 }}
      out:fade={{ duration: 300 }}
    >
      <Notification
        type={notification.type}
        timeLeftPercent={(notification.timeLeft / notification.initialTime) * 100}
        onClose={() => remove(notification.id)}
      >
        {notification.message}
      </Notification>
    </div>
  {/each}
</div>
