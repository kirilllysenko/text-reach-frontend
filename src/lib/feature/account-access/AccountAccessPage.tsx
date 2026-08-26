import { Meta, Title } from "@solidjs/meta";
import { For } from "solid-js";
import { PATH_SIGN_IN } from "~/lib/app/paths";
import { AlertTriangle, Check, Logo } from "~/lib/icons";
import { classes } from "~/lib/styles/classes";

interface AccountAccessPageProps {
  eyebrow: string;
  title: string;
  description: string;
  steps: string[];
  note: string;
  tone?: "warning" | "neutral";
}

export function AccountAccessPage(props: AccountAccessPageProps) {
  return (
    <main
      class={`relative isolate flex min-h-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-100 via-slate-50 to-stone-100 px-3 py-8 sm:px-6`}
    >
      <Title>{props.title} | Text Reach</Title>
      <Meta name="robots" content="noindex" />
      <div class="pointer-events-none absolute -top-36 -right-24 size-96 rounded-full bg-sky-200/35 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-36 -left-24 size-96 rounded-full bg-slate-300/35 blur-3xl" />
      <section
        class={`relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/80 bg-white/75 shadow-[0_24px_70px_-28px_rgba(30,41,59,0.5)] backdrop-blur-md`}
        aria-labelledby="account-access-title"
      >
        <div class="border-b border-white/80 px-5 py-4 sm:px-8">
          <a href={PATH_SIGN_IN} class="inline-flex items-center gap-2 text-slate-800 no-underline">
            <Logo class="fill-sky-600 size-8" />
            <span class="text-lg font-semibold [font-stretch:expanded]">Text Reach</span>
          </a>
        </div>
        <div class="px-5 py-7 sm:px-8 sm:py-10">
          <div
            class={classes([
              "mb-6 grid size-14 place-items-center rounded-2xl border shadow-sm",
              props.tone === "neutral" ? "border-slate-200 bg-slate-100/90" : "border-amber-200 bg-amber-100/90",
            ])}
          >
            <AlertTriangle
              class={classes(["size-7", props.tone === "neutral" ? "fill-slate-600" : "fill-amber-800"])}
            />
          </div>
          <p class="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">{props.eyebrow}</p>
          <h1 id="account-access-title" class="mt-2 max-w-xl text-3xl leading-tight text-slate-800 sm:text-4xl">
            {props.title}
          </h1>
          <p class="mt-4 max-w-xl text-base leading-7 text-slate-600">{props.description}</p>
          <div class="mt-8 rounded-2xl border border-white/90 bg-white/65 p-4 sm:p-5">
            <h2 class="text-base font-semibold text-slate-800">What you can do</h2>
            <ul class="mt-4 space-y-3">
              <For each={props.steps}>
                {(step) => (
                  <li class="flex gap-3 text-sm leading-6 text-slate-600">
                    <span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sky-100">
                      <Check class="size-3.5 fill-sky-700" />
                    </span>
                    <span>{step}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
          <p class="mt-5 text-sm leading-6 text-slate-500">{props.note}</p>
          <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={PATH_SIGN_IN}
              class={`flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-700 px-5 text-base font-medium text-white no-underline shadow-sm transition-colors hover:bg-slate-800`}
            >
              Return to sign in
            </a>
            <span class="text-center text-xs text-slate-500 sm:text-left">
              Your workspace data is not shown on this page.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
