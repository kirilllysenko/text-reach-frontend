<script lang="ts">
  import { CampaignDtoStatus } from "$lib/api/index.schemas";
  import { statusLabelMap, type CampaignStatus } from "./campaigns-models";

  interface Props {
    status?: CampaignStatus;
  }

  let { status = CampaignDtoStatus.PENDING }: Props = $props();

  const pausedStatuses: NonNullable<CampaignStatus>[] = [
    CampaignDtoStatus.PAUSED_BY_USER,
    CampaignDtoStatus.PAUSED_BY_BILLING,
  ];
  const cancelledStatuses: NonNullable<CampaignStatus>[] = [
    CampaignDtoStatus.CANCELLED_BY_USER,
    CampaignDtoStatus.CANCELLED_BY_TIMEOUT,
  ];

  const usesAccentColor = $derived(
    status === CampaignDtoStatus.SENT ||
      status === CampaignDtoStatus.SENDING ||
      pausedStatuses.includes(status) ||
      cancelledStatuses.includes(status),
  );
</script>

<span
  class={[
    "rounded-full border px-2.5 py-1 text-xs font-medium",
    status === CampaignDtoStatus.SENT && "border-emerald-200/80 bg-emerald-100/80 text-emerald-700",
    status === CampaignDtoStatus.SENDING && "border-sky-200/80 bg-sky-100/80 text-sky-700",
    pausedStatuses.includes(status) && "border-amber-200/80 bg-amber-100/80 text-amber-800",
    cancelledStatuses.includes(status) && "border-rose-200/80 bg-rose-100/80 text-rose-700",
    !usesAccentColor && "border-slate-300/80 bg-slate-200/80 text-slate-700",
  ]}
>
  {statusLabelMap[status]}
</span>
