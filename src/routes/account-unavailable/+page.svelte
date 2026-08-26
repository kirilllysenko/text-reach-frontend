<script lang="ts">
  import AccountAccessPage from "$lib/feature/account-access/AccountAccessPage.svelte";

  const steps = [
    "Return to sign in and check that you are using the intended account.",
    "Ask the person who manages your workspace whether your access changed.",
    "Try again after the account or your membership has been restored.",
  ];
</script>

<AccountAccessPage
  eyebrow="Access unavailable"
  title="We can’t open this workspace"
  description="Your session is valid, but it no longer has access to an active Mega Texting workspace."
  note="For security, this page does not reveal whether the workspace or an individual membership changed."
  tone="neutral"
  {steps}
/>
