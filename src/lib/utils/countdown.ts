import { createSignal, onSettled } from "solid-js";

export function createCountdown() {
  const [remainingSeconds, setRemainingSeconds] = createSignal(0);
  let intervalId: ReturnType<typeof setInterval> | undefined;

  function stop(): void {
    if (intervalId) clearInterval(intervalId);
    intervalId = undefined;
  }

  function start(seconds: number): void {
    stop();
    setRemainingSeconds(seconds);
    intervalId = setInterval(() => {
      setRemainingSeconds((remaining) => {
        if (remaining <= 1) {
          stop();
          return 0;
        }
        return remaining - 1;
      });
    }, 1_000);
  }

  onSettled(() => stop);

  return { remainingSeconds, start, stop };
}
