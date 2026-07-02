<script lang="ts">
  import { page } from "$app/state";
  import CustomFieldFormPage from "../../components/CustomFieldFormPage.svelte";
</script>

<CustomFieldFormPage mode="edit" id={page.params.id} />
