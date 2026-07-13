import { CampaignStatus as CampaignStatusEnum, type CampaignDto, type ContactGroupDto } from "$lib/api/index.schemas";
import type { CampaignViewModel } from "$lib/feature/campaign/campaign-view-data";

export function mergeContactGroupNames(
  currentNames: Record<string, string>,
  groups: ContactGroupDto[],
): Record<string, string> {
  const names = { ...currentNames };

  for (const group of groups) {
    if (!group.id || !group.name) {
      continue;
    }

    names[group.id] = group.name;
  }

  return names;
}

export function toCampaignViewModel(dto: CampaignDto, index: number): CampaignViewModel {
  const id = dto.id ?? `campaign-${index + 1}`;
  const status = dto.status ?? CampaignStatusEnum.PENDING;
  const messageCount = Math.max(dto.messageCount ?? 0, dto.sentMessageCount ?? 0);
  const sentMessageCount = Math.min(Math.max(dto.sentMessageCount ?? 0, 0), messageCount);
  const pendingMessageCount = Math.max(messageCount - sentMessageCount, 0);

  return {
    id,
    name: dto.name ?? `Campaign ${index + 1}`,
    messageTemplate: dto.messageTemplate ?? "",
    status,
    messageCount,
    sentMessageCount,
    pendingMessageCount,
    contactGroupIds: dto.contactGroupIds ?? [],
  };
}
