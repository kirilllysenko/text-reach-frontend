<script lang="ts">
  import { page } from "$app/state";
  import ContactFormPage from "../../components/ContactFormPage.svelte";
</script>

<ContactFormPage mode="edit" id={page.params.id} />
