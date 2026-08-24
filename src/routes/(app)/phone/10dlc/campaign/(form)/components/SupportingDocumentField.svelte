<script lang="ts">
  import { TenDlcCampaignDocumentUploadUrlStore } from "$houdini";
  import { Field, FieldError, FieldLabel } from "$lib";

  interface Props {
    disabled?: boolean;
    error?: string | null;
    value?: string;
  }

  const uploadUrlQuery = new TenDlcCampaignDocumentUploadUrlStore();
  let { disabled = false, error = null, value = $bindable("") }: Props = $props();
  let filename = $state("");
  let uploading = $state(false);
  let uploadError = $state<string | null>(null);

  async function selectDocument(event: Event): Promise<void> {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    if (!isSupported(file)) {
      uploadError = "Choose a PNG or JPEG document.";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      uploadError = "The document must be 10 MB or smaller.";
      return;
    }

    uploading = true;
    uploadError = null;
    try {
      const response = await uploadUrlQuery.fetch({ variables: { filename: file.name } });
      const upload = response.data?.campaignMediaUploadUrl;
      if (response.errors || !upload) {
        uploadError = "There was an error preparing the document upload.";
        return;
      }

      const uploadResponse = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadResponse.ok) {
        uploadError = "Could not upload the document.";
        return;
      }

      filename = file.name;
      value = upload.mediaUrl;
    } catch {
      uploadError = "Could not upload the document.";
    } finally {
      uploading = false;
    }
  }

  function isSupported(file: File): boolean {
    return ["image/jpeg", "image/png"].includes(file.type.toLowerCase());
  }
</script>

<Field>
  <FieldLabel for="ten-dlc-campaign-document">Consent or opt-in evidence</FieldLabel>
  <p class="mb-2 text-xs leading-5 text-slate-500">
    Upload a PNG or JPEG screenshot of the customer opt-in experience. Maximum 10 MB.
  </p>
  <input
    id="ten-dlc-campaign-document"
    class="sr-only"
    type="file"
    accept=".png,.jpg,.jpeg"
    disabled={disabled || uploading}
    onchange={selectDocument}
  />
  <div class="flex flex-wrap items-center gap-3">
    <label
      id="ten-dlc-campaign-document-choose"
      for="ten-dlc-campaign-document"
      aria-disabled={disabled || uploading}
      class={[
        `flex h-9 items-center justify-center rounded-xl border border-white/80 bg-white/90 px-3 text-sm
          font-medium text-slate-700 shadow-sm`,
        disabled || uploading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-white",
      ]}>{uploading ? "Uploading…" : value ? "Replace document" : "Choose document"}</label
    >
    {#if filename}
      <span id="ten-dlc-campaign-document-name" class="max-w-full truncate text-sm text-emerald-700">{filename}</span>
    {/if}
  </div>
  <FieldError class="mt-2" error={uploadError ?? error} />
</Field>
