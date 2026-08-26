import { createContext } from "svelte";
import { SvelteMap } from "svelte/reactivity";

const UPDATE_INTERVAL = 100;
const SHOW_DURATION = 10_000;

export interface NotificationData {
  id: string;
  message: string;
  type: "info" | "error";
  initialTime: number;
  timeLeft: number;
}

export function createNotificationsState() {
  const state = $state({ notifications: [] as NotificationData[], paused: false });
  const intervals = new SvelteMap<string, ReturnType<typeof setInterval>>();

  function remove(id: string): void {
    const intervalId = intervals.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      intervals.delete(id);
    }
    state.notifications = state.notifications.filter((notification) => notification.id !== id);
    state.paused = false;
  }

  function show(message: string, type: NotificationData["type"]): void {
    const existing = state.notifications.find((notification) => notification.message === message);
    if (existing) {
      existing.timeLeft = SHOW_DURATION;
      return;
    }

    const notification: NotificationData = {
      id: crypto.randomUUID(),
      message,
      type,
      initialTime: SHOW_DURATION,
      timeLeft: SHOW_DURATION,
    };
    state.notifications = [notification, ...state.notifications];
    const intervalId = setInterval(() => {
      if (state.paused) return;
      notification.timeLeft -= UPDATE_INTERVAL;
      if (notification.timeLeft <= 0) remove(notification.id);
    }, UPDATE_INTERVAL);
    intervals.set(notification.id, intervalId);
  }

  return {
    get notifications() {
      return state.notifications;
    },
    showInfo: (message: string) => show(message, "info"),
    showError: (message: string) => show(message, "error"),
    setPaused: (value: boolean) => (state.paused = value),
    remove,
  };
}

export type NotificationsState = ReturnType<typeof createNotificationsState>;
export const [getNotificationsState, setNotificationsState] = createContext<NotificationsState>();
