<script lang="ts">
  import PageTitle from "$lib/components/page-title/PageTitle.svelte";
  import ProfileNameForm from "./components/ProfileNameForm.svelte";
  import ProfilePasswordForm from "./components/ProfilePasswordForm.svelte";
</script>

<div
  class="flex h-full min-h-0 flex-col rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50
    to-stone-100 p-2 sm:p-3"
>
  <PageTitle title="Profile" />

  <div
    class="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_20px_45px_-25px_rgba(30,41,59,0.45)]
      backdrop-blur-md sm:p-6"
  >
    <ProfileNameForm />
    <div class="pt-10">
      <ProfilePasswordForm />
    </div>
  </div>
</div>
