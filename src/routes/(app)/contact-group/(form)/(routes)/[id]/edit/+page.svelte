<script lang="ts">
  import { page } from "$app/state";
  import ContactGroupFormPage from "../../../components/ContactGroupFormPage.svelte";
</script>

<ContactGroupFormPage mode="edit" id={page.params.id} />
