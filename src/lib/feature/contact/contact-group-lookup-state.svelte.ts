import { SortDirection, type ContactGroupDto } from "$lib/api/index.schemas";
import { fetchContactGroups as fetchContactGroupList } from "$lib/api/contact-group/contact-group";
import { defaultContactGroupNameById, mergeContactGroupNames } from "./contact-display";

export interface ContactGroupOption {
  value: string;
  label: string;
}

export class ContactGroupLookupState {
  contactGroupNameById = $state<Record<string, string>>({ ...defaultContactGroupNameById });
  contactGroupList = $state<ContactGroupDto[]>([]);

  groupOptions = $derived.by<ContactGroupOption[]>(() => {
    if (this.contactGroupList.length > 0) {
      return this.contactGroupList.map((group) => ({
        value: group.id,
        label: group.name,
      }));
    }

    return Object.entries(this.contactGroupNameById).map(([id, name]) => ({
      value: id,
      label: name,
    }));
  });

  constructor() {
    void this.load();
  }

  load = async (): Promise<void> => {
    try {
      const response = await fetchContactGroupList(
        {
          pageSize: 300,
          sort: {
            name: {
              order: 0,
              direction: SortDirection.ASC,
            },
          },
        },
        { credentials: "include" },
      );

      if (response.status !== 200) {
        return;
      }

      this.contactGroupList = response.data.items ?? [];
      this.contactGroupNameById = mergeContactGroupNames(this.contactGroupNameById, this.contactGroupList);
    } catch {
      this.contactGroupList = [];
    }
  };
}
