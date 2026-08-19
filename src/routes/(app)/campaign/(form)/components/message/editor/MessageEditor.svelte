<script lang="ts">
  import { tick } from "svelte";
  import { Button } from "$lib";
  import Plus from "text-reach-frontend-library/icons/Plus.svelte";
  import ContactFieldMenu from "./ContactFieldMenu.svelte";
  import EmojiIcon from "./icons/EmojiIcon.svelte";
  import ImageIcon from "./icons/ImageIcon.svelte";
  import LinkIcon from "./icons/LinkIcon.svelte";
  import {
    createFieldPart,
    createTextPart,
    smsSegmentCount,
    toPreviewText,
    type ContactFieldOption,
    type MessagePart,
    type MessageTextPart,
  } from "../message";

  interface Props {
    disabled?: boolean;
    error?: string | null;
    imageDisabled?: boolean;
    onAddImage: () => void;
    parts?: MessagePart[];
  }

  let {
    disabled = false,
    error = null,
    imageDisabled = false,
    onAddImage,
    parts = $bindable<MessagePart[]>([]),
  }: Props = $props();
  let container = $state<HTMLDivElement | null>(null);
  let fieldMenuOpen = $state(false);
  let activeTextPartId = $state<string | null>(null);
  let activeOffset = $state(0);

  const previewText = $derived(toPreviewText(parts));
  const characterCount = $derived(previewText.length);
  const segmentCount = $derived(smsSegmentCount(previewText));
  const emptyMessage = $derived(previewText.length === 0);

  function captureCaret(part: MessageTextPart): void {
    activeTextPartId = part.id;
    const selection = window.getSelection();
    activeOffset = Math.min(selection?.anchorOffset ?? part.value.length, part.value.length);
  }

  function handleInput(part: MessageTextPart): void {
    captureCaret(part);
  }

  async function focusTextPart(id: string, offset: number): Promise<void> {
    await tick();
    const element = container?.querySelector<HTMLElement>(`[data-message-part-id="${id}"]`);
    if (!element) return;

    element.focus();
    const textNode = element.firstChild ?? element.appendChild(document.createTextNode(""));
    const range = document.createRange();
    range.setStart(textNode, Math.min(offset, textNode.textContent?.length ?? 0));
    range.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    activeTextPartId = id;
    activeOffset = offset;
  }

  function activeTextPart(): { index: number; part: MessageTextPart } | null {
    const index = parts.findIndex((part) => part.type === "text" && part.id === activeTextPartId);
    if (index < 0) return null;
    return { index, part: parts[index] as MessageTextPart };
  }

  async function insertField(field: ContactFieldOption): Promise<void> {
    const active = activeTextPart();
    if (!active) {
      const trailingText = createTextPart();
      parts = [...parts, createFieldPart(field), trailingText];
      fieldMenuOpen = false;
      await focusTextPart(trailingText.id, 0);
      return;
    }

    const before = active.part.value.slice(0, activeOffset);
    const after = active.part.value.slice(activeOffset);
    const trailingText = createTextPart(after);
    parts = [
      ...parts.slice(0, active.index),
      { ...active.part, value: before },
      createFieldPart(field),
      trailingText,
      ...parts.slice(active.index + 1),
    ];
    fieldMenuOpen = false;
    await focusTextPart(trailingText.id, 0);
  }

  async function insertText(text: string): Promise<void> {
    const active = activeTextPart();
    if (!active) {
      const textPart = createTextPart(text);
      parts = [...parts, textPart];
      await focusTextPart(textPart.id, text.length);
      return;
    }

    active.part.value = `${active.part.value.slice(0, activeOffset)}${text}${active.part.value.slice(activeOffset)}`;
    await focusTextPart(active.part.id, activeOffset + text.length);
  }

  function removeAdjacentField(event: KeyboardEvent, part: MessageTextPart): void {
    const selection = window.getSelection();
    const offset = selection?.anchorOffset ?? 0;
    const index = parts.findIndex((item) => item.id === part.id);
    if (index < 0) return;

    if (event.key === "Backspace" && offset === 0 && parts[index - 1]?.type === "field") {
      event.preventDefault();
      const leadingPart = parts[index - 2];
      if (leadingPart?.type === "text") {
        const leadingLength = leadingPart.value.length;
        const mergedPart = { ...leadingPart, value: `${leadingPart.value}${part.value}` };
        parts = [...parts.slice(0, index - 2), mergedPart, ...parts.slice(index + 1)];
        void focusTextPart(mergedPart.id, leadingLength);
      } else {
        parts = [...parts.slice(0, index - 1), ...parts.slice(index)];
      }
    }

    if (event.key === "Delete" && offset === part.value.length && parts[index + 1]?.type === "field") {
      event.preventDefault();
      const trailingPart = parts[index + 2];
      if (trailingPart?.type === "text") {
        const originalLength = part.value.length;
        const mergedPart = { ...part, value: `${part.value}${trailingPart.value}` };
        parts = [...parts.slice(0, index), mergedPart, ...parts.slice(index + 3)];
        void focusTextPart(mergedPart.id, originalLength);
      } else {
        parts = [...parts.slice(0, index + 1), ...parts.slice(index + 2)];
      }
    }
  }

  function focusLastTextPart(): void {
    const lastTextPart = parts.findLast((part): part is MessageTextPart => part.type === "text");
    if (lastTextPart) {
      void focusTextPart(lastTextPart.id, lastTextPart.value.length);
      return;
    }

    const textPart = createTextPart();
    parts = [...parts, textPart];
    void focusTextPart(textPart.id, 0);
  }

  function handleDocumentPointerDown(event: PointerEvent): void {
    const target = event.target as Node | null;
    if (target && !container?.contains(target)) {
      fieldMenuOpen = false;
    }
  }
</script>

<svelte:document onpointerdown={handleDocumentPointerDown} />

<div bind:this={container} class="relative">
  <div
    id="campaign-message-editor"
    role="textbox"
    aria-labelledby="campaign-message-label"
    aria-multiline="true"
    aria-invalid={Boolean(error)}
    tabindex="0"
    class={[
      `flex min-h-28 w-full flex-wrap content-start items-start gap-x-1 gap-y-1 rounded-t-[1.05rem] border-none
      bg-white/70 px-3 py-3 text-slate-700 shadow-[inset_0px_0px_7px_3px_rgba(30,41,59,0.1)]
      focus-within:ring-2 focus-within:ring-sky-500/25 focus:outline-none`,
      error && "ring-2 ring-rose-500/25",
      disabled && "cursor-not-allowed opacity-70",
    ]}
    onclick={(event) => {
      if (event.target === event.currentTarget && !disabled) focusLastTextPart();
    }}
    onkeydown={(event) => {
      if (event.target === event.currentTarget && !disabled && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        focusLastTextPart();
      }
    }}
    onfocus={(event) => {
      if (event.target === event.currentTarget && !disabled) focusLastTextPart();
    }}
  >
    {#each parts as part (part.id)}
      {#if part.type === "field"}
        <span
          class="inline-flex h-6 items-center rounded-lg bg-sky-100 px-2 text-sm font-medium text-sky-700"
          contenteditable="false"
        >
          {part.label}
        </span>
      {:else}
        <span
          bind:textContent={part.value}
          data-message-part-id={part.id}
          data-placeholder={emptyMessage ? "Write your message" : undefined}
          contenteditable="plaintext-only"
          role="presentation"
          class="min-h-6 min-w-0 break-words whitespace-pre-wrap outline-none empty:min-w-1 data-[placeholder]:before:text-slate-400 data-[placeholder]:before:content-[attr(data-placeholder)]"
          onfocus={() => captureCaret(part)}
          onkeyup={() => captureCaret(part)}
          onpointerup={() => captureCaret(part)}
          onbeforeinput={(event) => {
            if (disabled) event.preventDefault();
          }}
          oninput={() => handleInput(part)}
          onkeydown={(event) => removeAdjacentField(event, part)}
        ></span>
      {/if}
    {/each}
  </div>

  <div
    class="flex flex-wrap items-center gap-2 rounded-b-[1.05rem] border-t border-slate-100 bg-white/80 p-2 shadow-sm"
  >
    <div class="relative">
      <Button
        small
        variant="secondary"
        icon={Plus}
        active={fieldMenuOpen}
        {disabled}
        aria-expanded={fieldMenuOpen}
        onclick={() => (fieldMenuOpen = !fieldMenuOpen)}
      >
        Contact field
      </Button>
      {#if fieldMenuOpen}
        <ContactFieldMenu onSelect={insertField} />
      {/if}
    </div>

    <Button small variant="secondary" icon={EmojiIcon} {disabled} onclick={() => insertText("😊")}>Emoji</Button>
    <Button small variant="secondary" icon={LinkIcon} {disabled} onclick={() => insertText("https://")}>Link</Button>
    <Button small variant="secondary" icon={ImageIcon} disabled={disabled || imageDisabled} onclick={onAddImage}>
      Image
    </Button>

    <p class="ml-auto text-xs text-slate-500">
      {characterCount}
      {characterCount === 1 ? "character" : "characters"} · {segmentCount}
      {segmentCount === 1 ? "segment" : "segments"}
    </p>
  </div>
</div>
