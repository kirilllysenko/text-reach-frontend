<script lang="ts">
  import { tick, untrack } from "svelte";
  import { VirtualList } from "svelte-virtuallists";
  import type { HTMLInputAttributes } from "svelte/elements";
  import Check from "$lib/icons/Check.svelte";
  import ChevronDown from "$lib/icons/ChevronDown.svelte";
  import Close from "$lib/icons/Close.svelte";
  import Spinner from "$lib/icons/Spinner.svelte";
  import type { MultiComboboxOption } from "$lib/components";

  interface Props extends Omit<HTMLInputAttributes, "value" | "type"> {
    value?: string[];
    options: MultiComboboxOption[];
    hasNextPage?: boolean;
    searchDebounceMs?: number;
    placeholder?: string;
    label?: string;
    id?: string;
    emptyText?: string;
    loadingText?: string;
    initialOptions?: MultiComboboxOption[];
    onChange?: (values: string[]) => void;
    onSearch?: (search: string) => void | Promise<void>;
    onLoadNextPage?: () => void | Promise<void>;
  }

  const uid = crypto.randomUUID();
  const popupId = `${uid}-popup`;
  const popupHeight = "240px";

  let {
    value = $bindable<string[]>([]),
    options,
    hasNextPage = false,
    searchDebounceMs = 250,
    placeholder = "Search options",
    label = "",
    id = `${uid}-input`,
    disabled = false,
    emptyText = "No options found",
    loadingText = "Loading options...",
    initialOptions = [],
    onChange,
    onSearch,
    onLoadNextPage,
    ...inputProps
  }: Props = $props();

  let container = $state<HTMLDivElement | null>(null);
  let input = $state<HTMLInputElement | null>(null);
  let displayByValue = $state<Record<string, string>>({});
  let loading = $state(false);
  let loadingMore = $state(false);
  let popupVisible = $state(false);
  let searchQuery = $state("");
  let searchSequence = 0;
  let lastLoadMoreTrigger = "";

  const selectedValues = $derived(new Set(value));
  const selectedOptions = $derived(
    value.map((current) => ({
      value: current,
      display: displayByValue[current] ?? current,
    })),
  );
  const virtualItems = $derived<(MultiComboboxOption | null)[]>(hasNextPage ? [...options, null] : options);

  $effect(() => {
    const loadedOptions = options;
    const selectedInitialOptions = initialOptions;
    untrack(() => {
      mergeOptionDisplays(selectedInitialOptions);
      mergeOptionDisplays(loadedOptions);
    });
  });

  $effect(() => {
    if (!popupVisible || disabled || !onSearch) {
      return;
    }

    const requestSequence = ++searchSequence;
    loading = true;
    lastLoadMoreTrigger = "";

    const timer = setTimeout(() => {
      void searchOptions(searchQuery, requestSequence);
    }, searchDebounceMs);

    return () => clearTimeout(timer);
  });

  function getOptionButtons(): HTMLButtonElement[] {
    if (!container) return [];
    return Array.from(container.querySelectorAll<HTMLButtonElement>("button[data-option]"));
  }

  function openPopup(): void {
    if (disabled) return;
    popupVisible = true;
  }

  function closePopup(): void {
    popupVisible = false;
    searchSequence += 1;
    loading = false;
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

    if (event.code === "Enter" && popupVisible && options[0]) {
      event.preventDefault();
      toggleOption(options[0]);
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
  }

  function handleFocus(): void {
    openPopup();
  }

  function handleDocumentPointerDown(event: PointerEvent): void {
    const target = event.target as Node | null;
    if (!target) return;
    if (container?.contains(target)) return;
    closePopup();
  }

  function focusOut(event: FocusEvent): void {
    const next = event.relatedTarget as HTMLElement | null;
    if (next && container?.contains(next)) return;
    closePopup();
  }

  function optionFocusIn(optionButton: HTMLButtonElement): void {
    optionButton.scrollIntoView({ behavior: "instant", block: "center", inline: "center" });
  }

  function handleOptionKeyDown(event: KeyboardEvent, option: MultiComboboxOption): void {
    if (event.code === "Enter" || event.code === "Space") {
      event.preventDefault();
      toggleOption(option);
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

  function toggleOption(option: MultiComboboxOption): void {
    mergeOptionDisplays([option]);

    const nextValues = selectedValues.has(option.value)
      ? value.filter((current) => current !== option.value)
      : [...value, option.value];

    value = nextValues;
    onChange?.(nextValues);
    input?.focus();
  }

  function removeSelectedOption(optionValue: string): void {
    const nextValues = value.filter((current) => current !== optionValue);

    value = nextValues;
    onChange?.(nextValues);
  }

  function mergeOptionDisplays(items: MultiComboboxOption[]): void {
    if (items.length === 0) {
      return;
    }

    const nextDisplayByValue = { ...displayByValue };

    for (const item of items) {
      nextDisplayByValue[item.value] = item.display;
    }

    displayByValue = nextDisplayByValue;
  }

  async function searchOptions(search: string, requestSequence: number): Promise<void> {
    try {
      await onSearch?.(search.trim());
    } catch {
      // The data owner decides how failed searches affect the controlled options.
    } finally {
      if (requestSequence === searchSequence) {
        loading = false;
      }
    }
  }

  async function loadNextPage(): Promise<void> {
    if (!hasNextPage || loading || loadingMore || !onLoadNextPage) {
      return;
    }

    loadingMore = true;

    try {
      await onLoadNextPage();
    } catch {
      // The data owner decides how failed pagination affects the controlled options.
      lastLoadMoreTrigger = "";
    } finally {
      loadingMore = false;
    }
  }

  function handleVisibleRange(range: { end: number; start: number }): void {
    if (!hasNextPage || loading || loadingMore || range.end < options.length - 1) {
      return;
    }

    const nextTrigger = `${options.length}:${range.end}:${searchQuery}`;
    if (nextTrigger === lastLoadMoreTrigger) {
      return;
    }

    lastLoadMoreTrigger = nextTrigger;
    void loadNextPage();
  }
</script>

<svelte:document onpointerdown={handleDocumentPointerDown} />

<div bind:this={container} class={["relative mb-1 min-w-10", inputProps.class]}>
  {#if label}
    <div class="mb-1 flex items-center">
      <label for={id} class="grow text-sm font-medium text-slate-700">{label}</label>
    </div>
  {/if}

  <div
    class={[
      `focus-within:border-sky-400 flex min-h-9 flex-wrap items-center gap-1.5 rounded-xl border bg-white/80 px-2
        py-1 shadow-sm backdrop-blur-sm focus-within:outline focus-within:outline-sky-500/60`,
      disabled
        ? `cursor-not-allowed border-slate-300/70 bg-slate-200/90 shadow-inner
          focus-within:border-slate-300/70 focus-within:outline-none`
        : popupVisible
          ? "border-sky-400 outline outline-sky-500/60"
          : "border-white/80",
    ]}
    onfocusout={focusOut}
  >
    {#each selectedOptions as option (option.value)}
      <span class="flex max-w-40 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
        <span class="truncate">{option.display}</span>
        <button
          type="button"
          class="text-slate-500 hover:cursor-pointer hover:text-slate-800"
          aria-label={`Remove ${option.display}`}
          onclick={() => removeSelectedOption(option.value)}
          {disabled}
        >
          <Close class="size-3 fill-current" />
        </button>
      </span>
    {/each}

    <input
      {...inputProps}
      bind:this={input}
      class={`min-w-24 grow bg-transparent text-base/7 text-slate-700 placeholder:text-slate-400
        placeholder:italic focus:outline-none disabled:text-slate-500`}
      {placeholder}
      type="text"
      {id}
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

    {#if loading}
      <Spinner class="size-4 animate-spin fill-none stroke-slate-500" />
    {:else if !disabled}
      <ChevronDown class="size-5 fill-slate-500" />
    {/if}
  </div>

  {#if popupVisible}
    <div
      id={popupId}
      style:height={popupHeight}
      class={`absolute z-10 mt-px w-full min-w-50 overflow-hidden rounded-xl border border-white/80 bg-white/95
        p-2 shadow-lg backdrop-blur-sm select-none`}
      onfocusout={focusOut}
      role="listbox"
      aria-multiselectable="true"
    >
      {#if loading && options.length === 0}
        <div class="flex h-full items-center justify-center text-sm text-slate-500">{loadingText}</div>
      {:else if options.length === 0}
        <div class="px-2 py-1 text-sm text-slate-500">{emptyText}</div>
      {:else}
        <VirtualList items={virtualItems} style={`height:${popupHeight}`} onVisibleRangeUpdate={handleVisibleRange}>
          {#snippet vl_slot({ item })}
            <div class="min-h-9">
              {#if item}
                <button
                  data-option
                  class={`flex min-h-9 w-full items-center gap-2 rounded-lg px-2 py-1 text-slate-700
                    hover:cursor-pointer hover:bg-white focus-visible:outline-2 focus-visible:outline-sky-500`}
                  tabindex="0"
                  type="button"
                  onclick={() => toggleOption(item)}
                  onfocusin={(event) => optionFocusIn(event.currentTarget)}
                  onkeydown={(event) => handleOptionKeyDown(event, item)}
                  role="option"
                  aria-selected={selectedValues.has(item.value)}
                >
                  <span
                    class={[
                      "flex size-4 shrink-0 items-center justify-center rounded border",
                      selectedValues.has(item.value) ? "border-slate-700 bg-slate-700" : "border-slate-300 bg-white",
                    ]}
                  >
                    {#if selectedValues.has(item.value)}
                      <Check class="size-3 fill-white" />
                    {/if}
                  </span>
                  <span class="min-w-0 grow truncate text-left">{item.display}</span>
                </button>
              {:else}
                <div class="flex min-h-9 items-center justify-center text-sm text-slate-500">
                  {loadingMore ? loadingText : "Scroll to load more"}
                </div>
              {/if}
            </div>
          {/snippet}
        </VirtualList>
      {/if}
    </div>
  {/if}
</div>
