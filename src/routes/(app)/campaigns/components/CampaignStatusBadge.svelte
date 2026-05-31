<script lang="ts">
  import { CampaignStatus as CampaignStatusEnum } from "$lib/api/index.schemas";
  import { statusLabelMap, type CampaignStatus } from "$lib/features/campaigns/campaigns-view-data";

  interface Props {
    status?: CampaignStatus;
  }

  let { status = CampaignStatusEnum.PENDING }: Props = $props();

  const pausedStatuses: NonNullable<CampaignStatus>[] = [
    CampaignStatusEnum.PAUSED_BY_USER,
    CampaignStatusEnum.PAUSED_BY_BILLING,
  ];
  const cancelledStatuses: NonNullable<CampaignStatus>[] = [
    CampaignStatusEnum.CANCELLED_BY_USER,
    CampaignStatusEnum.CANCELLED_BY_TIMEOUT,
  ];

  const usesAccentColor = $derived(
    status === CampaignStatusEnum.SENT ||
      status === CampaignStatusEnum.SENDING ||
      pausedStatuses.includes(status) ||
      cancelledStatuses.includes(status),
  );
</script>

<span
  class={[
    "rounded-full border px-2.5 py-1 text-xs font-medium",
    status === CampaignStatusEnum.SENT && "border-emerald-200/80 bg-emerald-100/80 text-emerald-700",
    status === CampaignStatusEnum.SENDING && "border-sky-200/80 bg-sky-100/80 text-sky-700",
    pausedStatuses.includes(status) && "border-amber-200/80 bg-amber-100/80 text-amber-800",
    cancelledStatuses.includes(status) && "border-rose-200/80 bg-rose-100/80 text-rose-700",
    !usesAccentColor && "border-slate-300/80 bg-slate-200/80 text-slate-700",
  ]}
>
  {statusLabelMap[status]}
</span>
