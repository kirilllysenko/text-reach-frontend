<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  interface ProfileData {
    name?: string | null;
    email?: string | null;
  }

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
    profile?: ProfileData | null;
    class?: string;
  }

  let { profile, class: classProp, ...avatarProps }: Props = $props();

  const initials = $derived.by(() => {
    if (!profile) {
      return "";
    }

    const trimmedName = profile.name?.trim();
    if (trimmedName) {
      return trimmedName
        .split(" ")
        .filter((value) => value.trim())
        .slice(0, 2)
        .map((value) => value.slice(0, 1).toUpperCase())
        .join("");
    }

    const email = profile.email?.trim();
    return email ? email.slice(0, 1).toUpperCase() : "";
  });
</script>

<div
  {...avatarProps}
  class={[
    `flex size-8 items-center justify-center rounded-full bg-slate-700 text-xs
      font-semibold tracking-[0.08em] text-white shadow-sm`,
    classProp,
  ]}
  aria-hidden="true"
>
  {initials}
</div>
