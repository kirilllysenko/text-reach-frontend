<script lang="ts">
  import { page } from "$app/state";
  import GroupFormPage from "../../components/GroupFormPage.svelte";
</script>

<GroupFormPage mode="edit" id={page.params.id} />
