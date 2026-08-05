<script lang="ts">
  import { page } from "$app/state";
  import UserFormPage from "../../../components/UserFormPage.svelte";
</script>

<UserFormPage mode="edit" id={page.params.id} />
