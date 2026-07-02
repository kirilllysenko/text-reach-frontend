<script lang="ts" generics="T">
  import { tick } from "svelte";
  import type { Snippet } from "svelte";
  import type { ClassValue, HTMLInputAttributes } from "svelte/elements";
  import DropdownPopup from "../components/DropdownPopup.svelte";
  import type { DropdownOption } from "../components/dropdown-types";

  interface Props extends Omit<HTMLInputAttributes, "class" | "value" | "id" | "disabled" | "type"> {
    options: DropdownOption<T>[];
    value?: DropdownOption<T>;
    placeholder?: string;
    label?: string;
    popupVisibleItems?: number;
    requiredMark?: boolean;
    inputId?: string;
    disabled?: boolean;
    error?: string | null;
    emptyText?: string;
    class?: ClassValue | null;
    onChange?: (option: DropdownOption<T> | undefined) => void;
    onBlur?: () => void;
    labelAddon?: Snippet;
    leftAddon?: Snippet;
    rightAddon?: Snippet;
  }

  const uid = crypto.randomUUID();

  let {
    options,
    value = $bindable<DropdownOption<T> | undefined>(),
    placeholder = "",
    label = "",
    popupVisibleItems = 5,
    requiredMark = false,
    inputId = `${uid}-input`,
    disabled = false,
    error = "",
    emptyText = "No options found",
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
  let inputFocused = $state(false);
  let searchQuery = $state(value?.value ?? "");

  const popupId = `${uid}-popup`;
  const popupMaxHeight = $derived(`${18 + popupVisibleItems * 36}px`);
  const filteredOptions = $derived.by(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return options;
    return options.filter((option) => option.value.toLocaleLowerCase().includes(query));
  });

  $effect(() => {
    if (!inputFocused) {
      searchQuery = value?.value ?? "";
    }
  });

  function getOptionButtons(): HTMLButtonElement[] {
    if (!popup) return [];
    return Array.from(popup.querySelectorAll<HTMLButtonElement>("button[data-option]"));
  }

  function openPopup(): void {
    if (disabled) return;
    popupVisible = true;
  }

  function closePopup(): void {
    popupVisible = false;
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
    if (event.code === "ArrowDown" || event.code === "ArrowUp") {
      event.preventDefault();
      openPopup();
      await focusEdgeOption(event.code);
      return;
    }

    if (event.code === "Enter") {
      if (!popupVisible) {
        openPopup();
        return;
      }

      if (filteredOptions[0]) {
        event.preventDefault();
        optionSelected(filteredOptions[0]);
      }
      return;
    }

    if (event.code === "Escape" && popupVisible) {
      event.stopPropagation();
      closePopup();
    }
  }

  function handleInput(event: Event): void {
    searchQuery = (event.currentTarget as HTMLInputElement).value;
    openPopup();

    if (value && searchQuery !== value.value) {
      value = undefined;
      onChange?.(undefined);
    }
  }

  function optionSelected(option: DropdownOption<T>): void {
    value = option;
    searchQuery = option.value;
    closePopup();
    onChange?.(option);
    input?.focus();
  }

  function handleOptionKeyDown(event: KeyboardEvent, option: DropdownOption<T>): void {
    if (event.code === "Enter") {
      event.preventDefault();
      optionSelected(option);
      return;
    }

    if (event.code === "Escape") {
      event.preventDefault();
      closePopup();
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

    if (event.code === "ArrowUp") {
      if (focusedItem > 0) {
        nodes[focusedItem - 1]?.focus();
      } else {
        input?.focus();
      }
    }
  }

  function focusOut(event: FocusEvent): void {
    const next = event.relatedTarget as HTMLElement | null;
    if (next && container?.contains(next)) return;

    inputFocused = false;
    searchQuery = value?.value ?? "";
    closePopup();
    onBlur?.();
  }

  function optionFocusIn(optionButton: HTMLButtonElement): void {
    optionButton.scrollIntoView({ behavior: "instant", block: "center", inline: "center" });
  }

  function handleFocus(): void {
    inputFocused = true;
    openPopup();
  }

  function handleDocumentPointerDown(event: PointerEvent): void {
    const target = event.target as Node | null;
    if (!target) return;
    if (container?.contains(target)) return;
    inputFocused = false;
    searchQuery = value?.value ?? "";
    closePopup();
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
      disabled
        ? `cursor-not-allowed border-slate-300/70 bg-slate-200/90 shadow-inner
          focus-within:border-slate-300/70 focus-within:outline-none`
        : popupVisible
          ? "border-sky-400 outline outline-sky-500/60"
          : "border-white/80",
    ]}
    onfocusout={focusOut}
  >
    {@render leftAddon?.()}

    <input
      {...inputProps}
      bind:this={input}
      class={`grow bg-transparent text-base/7 text-slate-700
        placeholder:text-slate-400 placeholder:italic focus:outline-none disabled:text-slate-500`}
      {placeholder}
      type="text"
      id={inputId}
      onkeydown={inputKeyDown}
      oninput={handleInput}
      onfocus={handleFocus}
      {disabled}
      value={searchQuery}
      aria-autocomplete="list"
      aria-expanded={popupVisible}
      aria-controls={popupId}
      role="combobox"
    />

    {@render rightAddon?.()}

    {#if !disabled}
      <svg class="size-5 fill-slate-500" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m7 10 5 5 5-5z" />
      </svg>
    {/if}
  </div>

  {#if popupVisible}
    <DropdownPopup
      id={popupId}
      bind:popup
      options={filteredOptions}
      {value}
      maxHeight={popupMaxHeight}
      {emptyText}
      onFocusOut={focusOut}
      onOptionFocusIn={optionFocusIn}
      onOptionKeyDown={handleOptionKeyDown}
      onSelect={optionSelected}
    />
  {/if}

  <div class="cursor-default text-sm text-rose-600">{error || "\u00A0"}</div>
</div>
