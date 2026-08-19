<script lang="ts">
  import { statusLabelMap, type CampaignStatus } from "./campaign-view-data";

  interface Props {
    status?: CampaignStatus;
  }

  let { status = "PENDING" }: Props = $props();

  const pausedStatuses: NonNullable<CampaignStatus>[] = ["PAUSED_BY_USER", "PAUSED_LOW_BALANCE"];
  const cancelledStatuses: NonNullable<CampaignStatus>[] = ["CANCELLED_BY_USER", "CANCELLED_BY_TIMEOUT"];

  const usesAccentColor = $derived(
    status === "SENT" || status === "SENDING" || pausedStatuses.includes(status) || cancelledStatuses.includes(status),
  );
</script>

<span
  class={[
    "rounded-full border px-2.5 py-1 text-xs font-medium",
    status === "SENT" && "border-emerald-200/80 bg-emerald-100/80 text-emerald-700",
    status === "SENDING" && "border-sky-200/80 bg-sky-100/80 text-sky-700",
    pausedStatuses.includes(status) && "border-amber-200/80 bg-amber-100/80 text-amber-800",
    cancelledStatuses.includes(status) && "border-rose-200/80 bg-rose-100/80 text-rose-700",
    !usesAccentColor && "border-slate-300/80 bg-slate-200/80 text-slate-700",
  ]}
>
  {statusLabelMap[status]}
</span>
