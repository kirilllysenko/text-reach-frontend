<script lang="ts">
  import { onDestroy } from "svelte";
  import { CampaignMediaUploadUrlStore } from "$houdini";
  import { FieldError } from "$lib";
  import MessageEditor from "./editor/MessageEditor.svelte";
  import ImageAttachmentsGrid from "./images/ImageAttachmentsGrid.svelte";
  import {
    campaignImageAccept,
    campaignImageContentType,
    MAX_CAMPAIGN_IMAGES,
    type CampaignMediaDraft,
  } from "./images/media";
  import type { MessagePart } from "./message";

  interface Props {
    disabled?: boolean;
    media?: CampaignMediaDraft[];
    messageError?: string | null;
    onPreviewImage: (attachment: CampaignMediaDraft) => void;
    parts?: MessagePart[];
    uploading?: boolean;
  }

  const uploadUrlQuery = new CampaignMediaUploadUrlStore();
  let {
    disabled = false,
    media = $bindable<CampaignMediaDraft[]>([]),
    messageError = null,
    onPreviewImage,
    parts = $bindable<MessagePart[]>([]),
    uploading = $bindable(false),
  }: Props = $props();
  let fileInput = $state<HTMLInputElement | null>(null);
  let uploadError = $state<string | null>(null);

  const imageLimitReached = $derived(media.length >= MAX_CAMPAIGN_IMAGES);
  const messageType = $derived(media.length > 0 ? "MMS" : "SMS");

  function attachFileInput(element: HTMLInputElement): () => void {
    fileInput = element;
    return () => {
      if (fileInput === element) fileInput = null;
    };
  }

  onDestroy(() => {
    for (const attachment of media) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
  });

  function openFilePicker(): void {
    if (!uploading && !imageLimitReached) fileInput?.click();
  }

  async function selectFiles(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const selectedFiles = [...(input.files ?? [])];
    input.value = "";
    if (selectedFiles.length === 0) return;

    const remainingSlots = MAX_CAMPAIGN_IMAGES - media.length;
    const files = selectedFiles.slice(0, remainingSlots);
    uploadError = selectedFiles.length > remainingSlots ? `Only ${MAX_CAMPAIGN_IMAGES} images can be attached.` : null;
    uploading = true;

    try {
      for (const file of files) {
        await uploadFile(file);
      }
    } finally {
      uploading = false;
    }
  }

  async function uploadFile(file: File): Promise<void> {
    const contentType = campaignImageContentType(file);
    if (!contentType) {
      uploadError = `${file.name} is not a supported image.`;
      return;
    }

    try {
      const response = await uploadUrlQuery.fetch({ variables: { filename: file.name } });
      const upload = response.data?.campaignMediaUploadUrl;
      if (response.errors || !upload) {
        uploadError = "There was an error preparing the image upload.";
        return;
      }

      const uploadResponse = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!uploadResponse.ok) {
        uploadError = `Could not upload ${file.name}.`;
        return;
      }

      media = [
        ...media,
        {
          contentType,
          filename: file.name,
          id: crypto.randomUUID(),
          previewUrl: URL.createObjectURL(file),
          sizeBytes: file.size,
          url: upload.mediaUrl,
        },
      ];
    } catch {
      uploadError = `Could not upload ${file.name}.`;
    }
  }

  function removeImage(attachment: CampaignMediaDraft): void {
    URL.revokeObjectURL(attachment.previewUrl);
    media = media.filter((item) => item.id !== attachment.id);
  }
</script>

<section class="mt-5 border-t border-slate-200/80 pt-5" aria-labelledby="campaign-message-title">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <h2 id="campaign-message-title" class="mr-auto text-base font-semibold text-slate-800">Message</h2>
    <span class="rounded-lg bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700">{messageType}</span>
    <span class="text-xs text-slate-500">{media.length > 0 ? "Image attached" : "Text only"}</span>
  </div>

  <p id="campaign-message-label" class="mb-1 text-sm font-medium text-slate-700">
    Content text<span class="text-rose-500">*</span>
  </p>
  <MessageEditor
    bind:parts
    error={messageError}
    imageDisabled={uploading || imageLimitReached}
    onAddImage={openFilePicker}
    {disabled}
  />
  <FieldError class="mt-2" error={messageError} />

  <input
    id="campaign-media-upload"
    {@attach attachFileInput}
    class="hidden"
    type="file"
    accept={campaignImageAccept}
    multiple
    onchange={selectFiles}
  />

  <ImageAttachmentsGrid attachments={media} onPreview={onPreviewImage} onRemove={removeImage} />

  {#if uploading}
    <p class="mt-2 text-xs text-slate-500" aria-live="polite">Uploading images…</p>
  {/if}
  <FieldError class="mt-2" error={uploadError} />
</section>
