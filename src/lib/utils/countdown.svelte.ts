type integer = number;

const TICK_INTERVAL_MS = 500;

function getRemainingSeconds(deadline?: number): integer {
  if (!deadline) {
    return 0;
  }

  const remainingMs = deadline - Date.now();
  if (remainingMs <= 0) {
    return 0;
  }

  return Math.ceil(remainingMs / 1000);
}

export class Countdown {
  remainingSeconds: number = $state(0);
  deadline: number | undefined = undefined;
  timerId: ReturnType<typeof setInterval> | undefined = undefined;

  start(countdownSeconds: number): void {
    const durationSeconds = Math.max(0, Math.floor(countdownSeconds));

    this.stop();

    if (durationSeconds === 0) {
      return;
    }

    this.deadline = Date.now() + durationSeconds * 1000;

    const tick = (): void => {
      this.remainingSeconds = getRemainingSeconds(this.deadline);

      if (this.remainingSeconds === 0) {
        this.stop();
      }
    };

    tick();
    this.timerId = setInterval(tick, TICK_INTERVAL_MS);
  }

  stop(): void {
    this.deadline = undefined;

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }

    this.remainingSeconds = 0;
  }
}
