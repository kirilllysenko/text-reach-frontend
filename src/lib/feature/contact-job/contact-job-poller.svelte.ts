import { isActiveContactJob, type ContactJobStatus } from "./contact-job";

interface ContactJob {
  id: string;
  status: ContactJobStatus;
}

interface ContactJobPollerOptions<Job extends ContactJob> {
  load: () => Promise<Job[]>;
  onCompleted?: () => Promise<void> | void;
}

export function createContactJobPoller<Job extends ContactJob>(options: ContactJobPollerOptions<Job>) {
  const state = $state({
    jobs: [] as Job[],
    loading: false,
    error: null as string | null,
  });
  let running = false;
  let refreshing = false;
  let initialized = false;
  let statuses = new Map<string, ContactJobStatus>();
  let timer: number | undefined;

  async function refresh(): Promise<void> {
    if (refreshing) {
      return;
    }

    refreshing = true;
    state.loading = state.jobs.length === 0;

    try {
      const jobs = await options.load();
      const completed =
        initialized && jobs.some((job) => job.status === "COMPLETED" && statuses.get(job.id) !== "COMPLETED");

      state.jobs = jobs;
      state.error = null;
      statuses = new Map(jobs.map((job) => [job.id, job.status]));
      initialized = true;

      if (completed) {
        await options.onCompleted?.();
      }
    } catch {
      state.error = "There was an error.";
    } finally {
      state.loading = false;
      refreshing = false;
    }
  }

  async function poll(): Promise<void> {
    await refresh();
    schedule(state.jobs.some((job) => isActiveContactJob(job.status)) ? 2_000 : 10_000);
  }

  function schedule(delay: number): void {
    if (!running) {
      return;
    }

    if (timer !== undefined) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => void poll(), delay);
  }

  function start(): () => void {
    running = true;
    void poll();
    return stop;
  }

  function stop(): void {
    running = false;
    if (timer !== undefined) {
      window.clearTimeout(timer);
    }
  }

  function wake(): void {
    if (timer !== undefined) {
      window.clearTimeout(timer);
    }
    void poll();
  }

  return {
    get jobs() {
      return state.jobs;
    },
    get loading() {
      return state.loading;
    },
    get error() {
      return state.error;
    },
    get active() {
      return state.jobs.some((job) => isActiveContactJob(job.status));
    },
    refresh,
    start,
    stop,
    wake,
  };
}

export type ContactJobPoller<Job extends ContactJob> = ReturnType<typeof createContactJobPoller<Job>>;
