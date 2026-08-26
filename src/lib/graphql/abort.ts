export function abortControllerFromSignal(signal?: AbortSignal): AbortController {
  const controller = new AbortController();

  if (!signal) {
    return controller;
  }

  if (signal.aborted) {
    controller.abort(signal.reason);
  } else {
    signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }

  return controller;
}
