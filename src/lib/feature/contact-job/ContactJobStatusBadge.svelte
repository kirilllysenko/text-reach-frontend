<script lang="ts">
  import type { ContactJobStatus } from "./contact-job";

  interface Props {
    status: ContactJobStatus;
  }

  let { status }: Props = $props();

  const label = $derived(status.charAt(0) + status.slice(1).toLowerCase());
</script>

<span
  class={[
    "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
    status === "QUEUED" && "border-slate-200 bg-slate-100 text-slate-600",
    status === "PROCESSING" && "border-sky-200 bg-sky-50 text-sky-700",
    status === "COMPLETED" && "bg-emerald-50 border-emerald-200 text-emerald-700",
    status === "FAILED" && "bg-rose-50 border-rose-200 text-rose-700",
  ]}
>
  {label}
</span>
