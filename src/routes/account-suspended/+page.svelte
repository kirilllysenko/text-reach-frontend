<script lang="ts">
  import AccountAccessPage from "$lib/feature/account-access/AccountAccessPage.svelte";

  const steps = [
    "Check with the person who manages your Mega Texting account.",
    "Resolve any outstanding account or compliance request.",
    "Return to sign in after an administrator restores access.",
  ];
</script>

<AccountAccessPage
  eyebrow="Account paused"
  title="This account is suspended"
  description="Your workspace is temporarily unavailable. An account administrator must restore access before you can continue."
  note="Signing in again will not bypass a suspension."
  {steps}
/>
