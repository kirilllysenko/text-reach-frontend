import type { CampaignViewModel } from "./campaign-view-data";

export interface CampaignDtoLike {
  contactGroups: readonly { id: string; name: string }[];
  id: string;
  messageCount: number;
  messageTemplate: string;
  name: string;
  scheduledAt: string | null;
  sentMessageCount: number;
  status: CampaignViewModel["status"];
  tenantPhone: {
    id: string;
    phoneNumber: string;
  };
}

export function mergeContactGroupNames(
  currentNames: Record<string, string>,
  groups: readonly { id: string; name: string }[],
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

export function toCampaignViewModel(dto: CampaignDtoLike, index: number): CampaignViewModel {
  const id = dto.id ?? `campaign-${index + 1}`;
  const status = dto.status ?? "SCHEDULED";
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
    scheduledAt: dto.scheduledAt,
    contactGroupIds: dto.contactGroups.map((group) => group.id),
    tenantPhoneId: dto.tenantPhone.id,
    tenantPhoneNumber: dto.tenantPhone.phoneNumber,
  };
}

export function formatCampaignSchedule(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
