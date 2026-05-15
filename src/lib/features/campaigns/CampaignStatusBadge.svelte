<script lang="ts">
  import { CampaignDtoStatus } from "$lib/api/index.schemas";
  import { statusLabelMap, type CampaignStatus } from "./campaigns-models";

  interface Props {
    status?: CampaignStatus;
  }

  let { status = CampaignDtoStatus.PENDING }: Props = $props();

  const badgeClass = $derived.by(() => {
    switch (status) {
      case CampaignDtoStatus.SENT:
        return "border border-emerald-200/80 bg-emerald-100/80 text-emerald-700";
      case CampaignDtoStatus.SENDING:
        return "border border-sky-200/80 bg-sky-100/80 text-sky-700";
      case CampaignDtoStatus.PAUSED_BY_USER:
      case CampaignDtoStatus.PAUSED_BY_BILLING:
        return "border border-amber-200/80 bg-amber-100/80 text-amber-800";
      case CampaignDtoStatus.CANCELLED_BY_USER:
      case CampaignDtoStatus.CANCELLED_BY_TIMEOUT:
        return "border border-rose-200/80 bg-rose-100/80 text-rose-700";
      default:
        return "border border-slate-300/80 bg-slate-200/80 text-slate-700";
    }
  });
</script>

<span class={["rounded-full px-2.5 py-1 text-xs font-medium", badgeClass]}>
  {statusLabelMap[status]}
</span>
