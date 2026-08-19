<script lang="ts">
  import type { ContactJobStatus } from "./contact-job";

  interface Props {
    status: ContactJobStatus;
    detail: string;
    progress?: number;
  }

  let { status, detail, progress }: Props = $props();

  const width = $derived(status === "COMPLETED" ? 100 : Math.max(0, Math.min(100, progress ?? 0)));
</script>

<div class="min-w-44 space-y-1.5">
  <div class="h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
    {#if status === "PROCESSING" && progress === undefined}
      <div class="contact-job-progress-indeterminate h-full w-1/3 rounded-full bg-slate-700"></div>
    {:else if status !== "QUEUED"}
      <div
        class={[
          "h-full rounded-full transition-[width] duration-300",
          status === "COMPLETED" && "bg-emerald-600",
          status === "PROCESSING" && "bg-slate-700",
          status === "FAILED" && "bg-rose-600",
        ]}
        style={`width: ${width}%`}
      ></div>
    {/if}
  </div>
  <p class="text-xs text-slate-500">{detail}</p>
</div>

<style>
  .contact-job-progress-indeterminate {
    animation: contact-job-progress 1.25s ease-in-out infinite;
  }

  @keyframes contact-job-progress {
    from {
      transform: translateX(-110%);
    }
    to {
      transform: translateX(310%);
    }
  }
</style>
