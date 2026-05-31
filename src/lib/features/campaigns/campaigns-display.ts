import { CampaignStatus as CampaignStatusEnum, type CampaignDto, type ContactGroupDto } from "$lib/api/index.schemas";
import type { CampaignStatus, CampaignViewModel } from "$lib/features/campaigns/campaigns-view-data";

export const defaultContactGroupNameById: Record<string, string> = {
  "mock-group-1": "High Value Customers",
  "mock-group-2": "Newsletter Subscribers",
  "mock-group-3": "Recent Signups",
  "mock-group-4": "Reactivation - February",
};

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
  const errorMessageCount = calculateErrorMessageCount(id, messageCount, sentMessageCount, status);
  const pendingMessageCount = Math.max(messageCount - sentMessageCount - errorMessageCount, 0);

  return {
    id,
    name: dto.name ?? `Campaign ${index + 1}`,
    messageTemplate: dto.messageTemplate ?? "",
    status,
    messageCount,
    sentMessageCount,
    pendingMessageCount,
    errorMessageCount,
    createdAt: deriveCreatedAt(id, index),
    contactGroupIds: dto.contactGroupIds ?? [],
    fromPhoneNumber: derivePhoneNumber(index),
  };
}

export function createMockCampaigns(): CampaignViewModel[] {
  const now = new Date();

  return [
    {
      id: "mock-1",
      name: "Spring Promo 2026",
      messageTemplate: "Spring sale is live. Reply STOP to opt out.",
      status: CampaignStatusEnum.SENDING,
      messageCount: 1560,
      sentMessageCount: 978,
      pendingMessageCount: 518,
      errorMessageCount: 64,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      contactGroupIds: ["mock-group-1", "mock-group-2", "mock-group-3"],
      fromPhoneNumber: "+1 (415) 555-0171",
    },
    {
      id: "mock-2",
      name: "VIP Follow-up",
      messageTemplate: "Hi there. We reserved this offer for VIP customers.",
      status: CampaignStatusEnum.PENDING,
      messageCount: 240,
      sentMessageCount: 0,
      pendingMessageCount: 240,
      errorMessageCount: 0,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      contactGroupIds: ["mock-group-1"],
      fromPhoneNumber: "+1 (415) 555-0199",
    },
    {
      id: "mock-3",
      name: "Reactivation Feb List",
      messageTemplate: "We miss you. Come back and get 20% off.",
      status: CampaignStatusEnum.SENT,
      messageCount: 2905,
      sentMessageCount: 2860,
      pendingMessageCount: 0,
      errorMessageCount: 45,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      contactGroupIds: ["mock-group-4"],
      fromPhoneNumber: "+1 (628) 555-0142",
    },
    {
      id: "mock-4",
      name: "March Warm Leads",
      messageTemplate: "Last chance to claim your onboarding bonus.",
      status: CampaignStatusEnum.CANCELLED_BY_TIMEOUT,
      messageCount: 480,
      sentMessageCount: 221,
      pendingMessageCount: 205,
      errorMessageCount: 54,
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      contactGroupIds: ["mock-group-2"],
      fromPhoneNumber: "+1 (628) 555-0158",
    },
  ];
}

function deriveCreatedAt(id: string, index: number): Date {
  const now = new Date();
  const dayOffset = index + (hash(id) % 5);
  return new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
}

function derivePhoneNumber(index: number): string {
  const fallbackNumbers = ["+1 (415) 555-0171", "+1 (628) 555-0142", "+1 (415) 555-0199", "+1 (628) 555-0158"];

  return fallbackNumbers[index % fallbackNumbers.length] ?? fallbackNumbers[0]!;
}

function calculateErrorMessageCount(
  id: string,
  messageCount: number,
  sentMessageCount: number,
  status: NonNullable<CampaignStatus>,
): number {
  if (messageCount === 0) {
    return 0;
  }

  if (status === CampaignStatusEnum.SENT) {
    return Math.max(messageCount - sentMessageCount, 0);
  }

  const notSent = Math.max(messageCount - sentMessageCount, 0);
  const ratio = 0.02 + (hash(id) % 8) / 100;
  return Math.min(notSent, Math.round(messageCount * ratio));
}

function hash(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}
