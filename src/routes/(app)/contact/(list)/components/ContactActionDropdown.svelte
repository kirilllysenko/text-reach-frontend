<script lang="ts">
  import { Button } from "$lib";
  import ChevronDown from "text-reach-frontend-library/icons/ChevronDown.svelte";
  import History from "text-reach-frontend-library/icons/History.svelte";
  import Spinner from "text-reach-frontend-library/icons/Spinner.svelte";
  import type { Component } from "svelte";
  import type { ClassValue } from "svelte/elements";

  interface Props {
    label: string;
    icon: Component<{ class?: ClassValue }>;
    fileLabel: string;
    fileIcon: Component<{ class?: ClassValue }>;
    historyLabel: string;
    activeJobs: boolean;
    fileHref?: string;
    historyHref: string;
    onFile?: () => void;
  }

  let { label, icon, fileLabel, fileIcon, historyLabel, activeJobs, fileHref, historyHref, onFile }: Props = $props();
  const FileIcon = $derived(fileIcon);
  let menuOpen = $state(false);
  let root = $state<HTMLDivElement | null>(null);
  const menuId = $derived(`${label.toLowerCase()}-contact-actions`);

  function toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    menuOpen = !menuOpen;
  }

  function select(action?: () => void): void {
    menuOpen = false;
    action?.();
  }

  function closeOnOutsideClick(event: PointerEvent): void {
    if (menuOpen && !root?.contains(event.target as Node)) {
      menuOpen = false;
    }
  }

  function closeOnEscape(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      menuOpen = false;
    }
  }
</script>

<svelte:document onpointerdown={closeOnOutsideClick} onkeydown={closeOnEscape} />

<div bind:this={root} class="relative">
  <Button
    variant="secondary"
    small
    {icon}
    active={menuOpen}
    aria-label={label}
    aria-haspopup="menu"
    aria-controls={menuId}
    aria-expanded={menuOpen}
    onclick={toggleMenu}
  >
    <span class="flex items-center gap-1">
      <span class="hidden sm:inline">{label}</span>
      {#if activeJobs}
        <Spinner class="stroke-sky-600 size-4 animate-spin fill-none" />
      {/if}
      <ChevronDown class={["size-4 fill-slate-500 transition-transform", menuOpen && "rotate-180"]} />
    </span>
  </Button>

  {#if menuOpen}
    <div
      id={menuId}
      class="absolute top-full right-0 z-50 mt-2 min-w-48 rounded-xl border border-white/80 bg-white/95 p-2
        shadow-lg backdrop-blur-md"
      role="menu"
      aria-label={`${label} actions`}
    >
      {#if fileHref}
        <a
          class="group flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700
            hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-2 focus-visible:outline-sky-500"
          href={fileHref}
          role="menuitem"
          onclick={() => select()}
        >
          <FileIcon class="size-4.5 fill-slate-500 group-hover:fill-slate-700" />
          {fileLabel}
        </a>
      {:else}
        <button
          class="group flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700
            hover:cursor-pointer hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-2
            focus-visible:outline-sky-500"
          type="button"
          role="menuitem"
          onclick={() => select(onFile)}
        >
          <FileIcon class="size-4.5 fill-slate-500 group-hover:fill-slate-700" />
          {fileLabel}
        </button>
      {/if}

      <a
        class="group flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700
          hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-2 focus-visible:outline-sky-500"
        href={historyHref}
        role="menuitem"
        onclick={() => select()}
      >
        <History class="size-4.5 fill-slate-500 group-hover:fill-slate-700" />
        {historyLabel}
      </a>
    </div>
  {/if}
</div>
