export interface CampaignMediaDraft {
  contentType: string;
  filename: string;
  id: string;
  previewUrl: string;
  sizeBytes: number;
  url: string;
}

export const MAX_CAMPAIGN_IMAGES = 10;

export const campaignImageAccept = ".jpg,.jpeg,.png,.gif,.bmp,.webp";

const contentTypeByExtension: Record<string, string> = {
  bmp: "image/bmp",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function campaignImageContentType(file: File): string | null {
  const normalizedType = file.type.trim().toLowerCase();
  if (Object.values(contentTypeByExtension).includes(normalizedType)) {
    return normalizedType;
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension ? (contentTypeByExtension[extension] ?? null) : null;
}
