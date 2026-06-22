<script lang="ts">
  import PageTitle from "$lib/components/page-title/PageTitle.svelte";

  interface Props {
    title: string;
    description: string;
  }

  let { title, description }: Props = $props();
</script>

<div
  class="flex h-full min-h-0 flex-col rounded-2xl bg-linear-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:p-3"
>
  <PageTitle {title} />

  <div
    class="rounded-2xl border border-white/80 bg-white/75 p-6 shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)]
      backdrop-blur-md"
  >
    <p class="max-w-xl text-slate-600">{description}</p>
  </div>
</div>
