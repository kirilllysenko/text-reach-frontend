import { afterEach, describe, expect, it, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("delays callback execution", () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    const debounced = debounce(callback, 250);

    debounced("search");

    vi.advanceTimersByTime(249);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith("search");
  });

  it("only invokes the latest pending call", () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    const debounced = debounce(callback, 250);

    debounced("a");
    vi.advanceTimersByTime(100);
    debounced("ab");
    vi.advanceTimersByTime(100);
    debounced("abc");
    vi.advanceTimersByTime(250);

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith("abc");
  });

  it("cancels a pending callback", () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    const debounced = debounce(callback, 250);

    debounced("search");
    debounced.cancel();
    vi.advanceTimersByTime(250);

    expect(callback).not.toHaveBeenCalled();
  });
});
