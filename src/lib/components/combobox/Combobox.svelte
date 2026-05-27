<script lang="ts" generics="T">
  import { tick } from "svelte";
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface ComboboxOption<T> {
    id: T;
    value: string;
  }

  interface Props extends Omit<
    HTMLInputAttributes,
    "class" | "value" | "id" | "disabled" | "placeholder" | "readonly" | "type"
  > {
    options: ComboboxOption<T>[];
    value?: ComboboxOption<T>;
    placeholder?: string;
    label?: string;
    popupVisibleItems?: number;
    requiredMark?: boolean;
    inputId?: string;
    disabled?: boolean;
    error?: string;
    class?: string;
    onChange?: (option: ComboboxOption<T>) => void;
    onBlur?: () => void;
    labelAddon?: Snippet;
    leftAddon?: Snippet;
    rightAddon?: Snippet;
  }

  const uid = crypto.randomUUID();

  let {
    options,
    value = $bindable<ComboboxOption<T> | undefined>(),
    placeholder = "",
    label = "",
    popupVisibleItems = 5,
    requiredMark = false,
    inputId = `${uid}-input`,
    disabled = false,
    error = "",
    onChange,
    onBlur,
    labelAddon,
    leftAddon,
    rightAddon,
    ...inputProps
  }: Props = $props();

  let popupVisible = $state(false);
  let container = $state<HTMLDivElement | null>(null);
  let input = $state<HTMLInputElement | null>(null);
  let popup = $state<HTMLDivElement | null>(null);

  const popupId = `${uid}-popup`;
  const currentLabel = $derived(value?.value ?? "");
  const popupMaxHeight = $derived(`${18 + popupVisibleItems * 36}px`);

  function getOptionButtons(): HTMLButtonElement[] {
    if (!popup) return [];
    return Array.from(popup.querySelectorAll<HTMLButtonElement>("button[data-option]"));
  }

  function handleInputClick(): void {
    if (disabled) return;
    popupVisible = !popupVisible;
  }

  async function focusEdgeOption(direction: "ArrowDown" | "ArrowUp"): Promise<void> {
    await tick();

    const nodes = getOptionButtons();
    if (!nodes.length) return;

    if (direction === "ArrowDown") {
      nodes[0]?.focus();
    } else {
      nodes[nodes.length - 1]?.focus();
    }
  }

  async function inputKeyDown(event: KeyboardEvent): Promise<void> {
    if (event.code === "Enter" || event.code === "Space") {
      event.preventDefault();
      handleInputClick();
      return;
    }

    if (event.code === "ArrowDown" || event.code === "ArrowUp") {
      event.preventDefault();
      if (!popupVisible) {
        popupVisible = true;
      }
      await focusEdgeOption(event.code);
      return;
    }

    if (event.code === "Escape" && popupVisible) {
      event.stopPropagation();
      popupVisible = false;
    }
  }

  function optionSelected(option: ComboboxOption<T>): void {
    value = option;
    popupVisible = false;
    onChange?.(option);
    input?.focus();
  }

  function handleOptionKeyDown(event: KeyboardEvent, option: ComboboxOption<T>): void {
    if (event.code === "Enter") {
      event.preventDefault();
      optionSelected(option);
      return;
    }

    if (event.code === "Escape") {
      event.preventDefault();
      popupVisible = false;
      input?.focus();
      return;
    }

    if (event.code !== "ArrowDown" && event.code !== "ArrowUp") return;

    event.preventDefault();

    const nodes = getOptionButtons();
    const focusedItem = nodes.findIndex((node) => node === document.activeElement);
    if (focusedItem === -1) return;

    if (event.code === "ArrowDown" && focusedItem < nodes.length - 1) {
      nodes[focusedItem + 1]?.focus();
    }

    if (event.code === "ArrowUp" && focusedItem > 0) {
      nodes[focusedItem - 1]?.focus();
    }
  }

  function focusOut(event: FocusEvent): void {
    const next = event.relatedTarget as HTMLElement | null;
    if (next && container?.contains(next)) return;
    popupVisible = false;
  }

  function optionFocusIn(optionButton: HTMLButtonElement): void {
    optionButton.scrollIntoView({ behavior: "instant", block: "center", inline: "center" });
  }

  function handleDocumentPointerDown(event: PointerEvent): void {
    const target = event.target as Node | null;
    if (!target) return;
    if (container?.contains(target)) return;
    popupVisible = false;
  }
</script>

<svelte:document onpointerdown={handleDocumentPointerDown} />

<div bind:this={container} class={["relative mb-1 min-w-10", inputProps.class]}>
  <div class="mb-1 flex items-center">
    <label
      for={inputId}
      class={["grow text-sm font-medium text-slate-700", requiredMark && "after:text-red-500 after:content-['*']"]}
    >
      {label}
    </label>
    {@render labelAddon?.()}
  </div>

  <div
    class={[
      `focus-within:border-sky-400 flex h-9 items-center gap-2 rounded-xl border bg-white/80 px-2 shadow-sm
        backdrop-blur-sm focus-within:outline focus-within:outline-sky-500/60`,
      popupVisible ? "border-sky-400 outline outline-sky-500/60" : "border-white/80",
    ]}
    onfocusout={focusOut}
  >
    {@render leftAddon?.()}

    <input
      {...inputProps}
      bind:this={input}
      readonly
      class={`grow cursor-default bg-transparent text-base/7 text-slate-700
        placeholder:text-slate-400 placeholder:italic focus:outline-none disabled:text-slate-500`}
      {placeholder}
      type="text"
      id={inputId}
      onkeydown={inputKeyDown}
      onblur={() => onBlur?.()}
      onfocus={(event) => {
        (event.currentTarget as HTMLInputElement).setSelectionRange(0, 0);
      }}
      onclick={handleInputClick}
      {disabled}
      value={currentLabel}
      aria-expanded={popupVisible}
      aria-controls={popupId}
      role="combobox"
    />

    {@render rightAddon?.()}

    <svg class="size-5 fill-slate-500" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 10 5 5 5-5z" />
    </svg>
  </div>

  {#if popupVisible}
    <div
      id={popupId}
      bind:this={popup}
      style:max-height={popupMaxHeight}
      class={`absolute z-10 mt-px w-full min-w-50 overflow-y-scroll rounded-xl border
        border-white/80 bg-white/95 p-2 shadow-lg backdrop-blur-sm select-none`}
      onfocusout={focusOut}
      role="listbox"
    >
      {#each options as option (option.id)}
        <button
          data-option
          class={`flex w-full items-center rounded-lg px-2 py-1 text-slate-700 hover:cursor-pointer
            hover:bg-white focus-visible:outline-2 focus-visible:outline-sky-500`}
          tabindex="0"
          type="button"
          onclick={() => optionSelected(option)}
          onfocusin={(event) => optionFocusIn(event.currentTarget as HTMLButtonElement)}
          onkeydown={(event) => handleOptionKeyDown(event, option)}
          role="option"
          aria-selected={option.id === value?.id}
        >
          <span class="grow text-left">{option.value}</span>
          {#if option.id === value?.id}
            <svg class="size-4 fill-slate-600" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.2 16.6 4.8 12.2l1.4-1.4 3 3 8.6-8.6 1.4 1.4z" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  <div class="cursor-default text-sm text-rose-600">{error || "\u00A0"}</div>
</div>
