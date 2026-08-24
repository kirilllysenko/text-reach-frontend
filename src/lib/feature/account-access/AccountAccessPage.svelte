<script lang="ts">
  import { resolve } from "$app/paths";
  import { PATH_SIGN_IN } from "$lib/app/paths";
  import AlertTriangle from "text-reach-frontend-library/icons/AlertTriangle.svelte";
  import Check from "text-reach-frontend-library/icons/Check.svelte";
  import Logo from "text-reach-frontend-library/icons/Logo.svelte";

  interface Props {
    eyebrow: string;
    title: string;
    description: string;
    steps: string[];
    note: string;
    tone?: "warning" | "neutral";
  }

  let { eyebrow, title, description, steps, note, tone = "warning" }: Props = $props();
</script>

<svelte:head>
  <title>{title} | Mega Texting</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main
  class="relative isolate flex min-h-full items-center justify-center overflow-hidden bg-linear-to-br
    from-slate-100 via-slate-50 to-stone-100 px-3 py-8 sm:px-6"
>
  <div class="pointer-events-none absolute -top-36 -right-24 size-96 rounded-full bg-sky-200/35 blur-3xl"></div>
  <div class="pointer-events-none absolute -bottom-36 -left-24 size-96 rounded-full bg-slate-300/35 blur-3xl"></div>

  <section
    class="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/80 bg-white/75
      shadow-[0_24px_70px_-28px_rgba(30,41,59,0.5)] backdrop-blur-md"
    aria-labelledby="account-access-title"
  >
    <div class="border-b border-white/80 px-5 py-4 sm:px-8">
      <a href={resolve(PATH_SIGN_IN)} class="inline-flex items-center gap-2 text-slate-800 no-underline">
        <Logo class="fill-sky-600 size-8" />
        <span class="text-lg font-semibold [font-stretch:expanded]">Mega Texting</span>
      </a>
    </div>

    <div class="px-5 py-7 sm:px-8 sm:py-10">
      <div
        class={[
          "mb-6 grid size-14 place-items-center rounded-2xl border shadow-sm",
          tone === "warning" ? "border-amber-200 bg-amber-100/90" : "border-slate-200 bg-slate-100/90",
        ]}
      >
        <AlertTriangle class={["size-7", tone === "warning" ? "fill-amber-800" : "fill-slate-600"]} />
      </div>

      <p class="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">{eyebrow}</p>
      <h1 id="account-access-title" class="mt-2 max-w-xl text-3xl leading-tight text-slate-800 sm:text-4xl">
        {title}
      </h1>
      <p class="mt-4 max-w-xl text-base leading-7 text-slate-600">{description}</p>

      <div class="mt-8 rounded-2xl border border-white/90 bg-white/65 p-4 sm:p-5">
        <h2 class="text-base font-semibold text-slate-800">What you can do</h2>
        <ul class="mt-4 space-y-3">
          {#each steps as step (step)}
            <li class="flex gap-3 text-sm leading-6 text-slate-600">
              <span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sky-100">
                <Check class="size-3.5 fill-sky-700" />
              </span>
              <span>{step}</span>
            </li>
          {/each}
        </ul>
      </div>

      <p class="mt-5 text-sm leading-6 text-slate-500">{note}</p>

      <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={resolve(PATH_SIGN_IN)}
          class="flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-700 px-5
            text-base font-medium text-white no-underline shadow-sm transition-colors hover:bg-slate-800"
        >
          Return to sign in
        </a>
        <span class="text-center text-xs text-slate-500 sm:text-left"
          >Your workspace data is not shown on this page.</span
        >
      </div>
    </div>
  </section>
</main>
