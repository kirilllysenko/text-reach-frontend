<script lang="ts">
  import type { Component } from "svelte";
  import type { ClassValue, HTMLButtonAttributes } from "svelte/elements";
  import Spinner from "$lib/icons/Spinner.svelte";

  type ButtonVariant = "primary" | "secondary";

  interface Props extends HTMLButtonAttributes {
    variant?: ButtonVariant;
    active?: boolean;
    activeClass?: ClassValue;
    small?: boolean;
    submit?: boolean;
    spinner?: boolean;
    disabled?: boolean;
    icon?: Component<{ class?: ClassValue }>;
  }

  const variantClasses = {
    primary: {
      enabled: `border-slate-700 bg-slate-700 text-white shadow-sm hover:not-disabled:bg-slate-800
        focus-visible:outline-offset-2`,
      active: "border-sky-300 bg-sky-50 text-sky-800 hover:not-disabled:bg-sky-50",
      icon: "fill-white",
      activeIcon: "fill-sky-700",
    },
    secondary: {
      enabled: `border-white/80 bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm hover:not-disabled:bg-white`,
      active: "border-sky-300 bg-sky-50/90 text-slate-700 hover:not-disabled:bg-sky-50/90",
      icon: "fill-slate-700",
      activeIcon: "fill-sky-700",
    },
  } satisfies Record<
    ButtonVariant,
    {
      enabled: ClassValue;
      active: ClassValue;
      icon: ClassValue;
      activeIcon: ClassValue;
    }
  >;

  let {
    class: classProp,
    variant = "primary",
    active = false,
    activeClass,
    small = false,
    submit = false,
    spinner = false,
    disabled = false,
    icon,
    children,
    ...buttonProps
  }: Props = $props();

  const motionDisabled = $derived(spinner || disabled);
  const variantClass = $derived(variantClasses[variant]);
  let hovered = $state(false);
  let pressed = $state(false);

  function handlePointerEnter() {
    hovered = true;
  }

  function handlePointerLeave() {
    hovered = false;
    pressed = false;
  }

  function handlePointerDown(event: PointerEvent) {
    if (motionDisabled) {
      return;
    }

    pressed = true;
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function handlePointerUp() {
    pressed = false;
  }

  function handlePointerCancel() {
    pressed = false;
  }
</script>

<button
  {...buttonProps}
  type={submit ? "submit" : "button"}
  disabled={spinner || disabled}
  onpointerenter={handlePointerEnter}
  onpointerleave={handlePointerLeave}
  onpointerdown={handlePointerDown}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerCancel}
  onlostpointercapture={handlePointerUp}
  class={[
    `button-motion relative flex items-center justify-center gap-1 rounded-xl border font-medium
      transition-[transform,box-shadow,background-color] duration-200 ease-out
      hover:not-disabled:cursor-pointer focus-visible:outline-2
      focus-visible:outline-sky-500`,
    small ? "h-7 pr-1 pl-1 text-sm" : "h-9 pr-3 pl-3 text-base",
    disabled && !spinner ? "border-white/70 bg-white/60 text-slate-400" : variantClass.enabled,
    classProp,
    !disabled && !spinner && active && variantClass.active,
    !disabled && !spinner && active && activeClass,
    !motionDisabled && hovered && !pressed && "button-motion--raised",
    !motionDisabled && pressed && "button-motion--pressed",
  ]}
>
  {#if icon}
    {@const Icon = icon}
    <Icon class={[small ? "size-4" : "size-5", active ? variantClass.activeIcon : variantClass.icon]} />
  {/if}

  {#if children}
    <div class="text-nowrap">
      {@render children()}
    </div>
  {/if}

  {#if spinner}
    <Spinner class={["ml-1 animate-spin fill-none stroke-slate-500", small ? "size-4" : "size-5"]} />
  {/if}
</button>

<style>
  .button-motion::after {
    content: "";
    position: absolute;
    inset-inline: 0;
    top: 0;
    bottom: -0.4rem;
  }

  .button-motion--raised {
    transform: translateY(-0.125rem);
    box-shadow:
      0 12px 24px -12px rgba(15, 23, 42, 0.65),
      0 6px 9px -6px rgba(15, 23, 42, 0.45);
  }

  .button-motion--pressed {
    transform: translateY(0.08rem);
    box-shadow:
      0 5px 12px -8px rgba(15, 23, 42, 0.35),
      0 2px 6px -5px rgba(15, 23, 42, 0.25);
  }
</style>
