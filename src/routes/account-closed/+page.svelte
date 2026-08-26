<script lang="ts">
  import AccountAccessPage from "$lib/feature/account-access/AccountAccessPage.svelte";

  const steps = [
    "Confirm that you signed in with the intended email address.",
    "Contact the person who managed this Mega Texting account if you need account records.",
    "Use another active account to continue working in Mega Texting.",
  ];
</script>

<AccountAccessPage
  eyebrow="Account closed"
  title="This account is no longer active"
  description="The workspace has been closed and is not available for sign-in."
  note="A closed account cannot be reopened from this screen."
  tone="neutral"
  {steps}
/>
