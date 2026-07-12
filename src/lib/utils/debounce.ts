export type DebouncedCallback<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void;
};

export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  waitMs: number,
): DebouncedCallback<TArgs> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = ((...args: TArgs): void => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = undefined;
      callback(...args);
    }, waitMs);
  }) as DebouncedCallback<TArgs>;

  debounced.cancel = (): void => {
    if (!timer) {
      return;
    }

    clearTimeout(timer);
    timer = undefined;
  };

  return debounced;
}
