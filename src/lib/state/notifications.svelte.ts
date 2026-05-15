import { SvelteMap } from "svelte/reactivity";

export interface NotificationData {
  id: string;
  message: string;
  type: "info" | "error";
  initialTime: number;
  timeLeft: number;
}

const UPDATE_INTERVAL = 100;
const SHOW_DURATION = 10_000;

class NotificationsState {
  notifications = $state<NotificationData[]>([]);
  paused = $state(false);
  private readonly intervals = new SvelteMap<string, ReturnType<typeof setInterval>>();

  showInfo = (message: string): void => {
    this.show(message, "info");
  };

  showError = (message: string): void => {
    this.show(message, "error");
  };

  setPaused = (value: boolean): void => {
    this.paused = value;
  };

  remove = (id: string): void => {
    const intervalId = this.intervals.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(id);
    }

    this.notifications = this.notifications.filter((it) => it.id !== id);
    this.paused = false;
  };

  private show(message: string, type: "info" | "error"): void {
    const existingMessage = this.notifications.find((value) => value.message === message);
    if (existingMessage) {
      existingMessage.timeLeft = SHOW_DURATION;
      return;
    }

    const notification: NotificationData = {
      id: crypto.randomUUID(),
      message,
      type,
      initialTime: SHOW_DURATION,
      timeLeft: SHOW_DURATION,
    };

    this.notifications = [notification, ...this.notifications];

    const intervalId = setInterval(() => {
      if (this.paused) {
        return;
      }

      notification.timeLeft -= UPDATE_INTERVAL;
      if (notification.timeLeft <= 0) {
        clearInterval(intervalId);
        this.intervals.delete(notification.id);
        this.remove(notification.id);
      }
    }, UPDATE_INTERVAL);

    this.intervals.set(notification.id, intervalId);
  }
}

export const notificationsState = new NotificationsState();
