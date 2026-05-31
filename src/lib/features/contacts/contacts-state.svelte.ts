import { SortDirection, type ContactGroupDto, type ErrorResponse } from "$lib/api/index.schemas";
import { fetchContactGroups } from "$lib/api/contact-group/contact-group";
import { countContacts, fetchContacts, getContactUploadUrl } from "$lib/api/contact/contact";
import type { DataTableFetchRequest, DataTableFetchResult } from "$lib/components/data-table";
import {
  contactSortFieldLabelMap,
  contactSortFieldOptions,
  type ContactSortField,
  type ContactSortRule,
  type ContactViewModel,
} from "$lib/features/contacts/contacts-view-data";
import { buildContactFilter, buildContactRequest } from "./contacts-query";
import {
  createMockContacts,
  defaultContactGroupNameById,
  filterMockContacts,
  mergeContactGroupNames,
  sortContacts,
  toContactViewModel,
} from "./contacts-display";

const DEFAULT_PAGE_SIZE = 50;
const EXPORT_PAGE_SIZE = 500;
const SEARCH_DEBOUNCE_MS = 250;
const MAX_EXPORT_PAGES = 200;

export class ContactsState {
  totalRows = $state(0);
  loadingError = $state<string | null>(null);
  actionMessage = $state<string | null>(null);
  contactGroupNameById = $state<Record<string, string>>({ ...defaultContactGroupNameById });
  contactGroups = $state<ContactGroupDto[]>([]);

  search = $state("");
  selectedContactGroupIds = $state<string[]>([]);
  birthdayAfter = $state("");
  emailContains = $state("");
  sortRules = $state<ContactSortRule[]>([
    {
      id: crypto.randomUUID(),
      field: "lastName",
      direction: SortDirection.ASC,
    },
    {
      id: crypto.randomUUID(),
      field: "firstName",
      direction: SortDirection.ASC,
    },
  ]);

  filtersOpen = $state(false);
  sortOpen = $state(false);
  tableKey = $state(0);
  importing = $state(false);
  exporting = $state(false);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private fallbackContacts = createMockContacts();

  sortFieldOptions = contactSortFieldOptions;

  activeFilterChips = $derived.by(() => {
    const chips: string[] = [];

    if (this.selectedContactGroupIds.length > 0) {
      const groupNames = this.selectedContactGroupIds.map((groupId) => this.contactGroupNameById[groupId] ?? groupId);
      chips.push(`Groups: ${groupNames.join(", ")}`);
    }

    if (this.birthdayAfter) {
      chips.push(`Birthday after: ${this.birthdayAfter}`);
    }

    if (this.emailContains) {
      chips.push(`Email: ${this.emailContains}`);
    }

    return chips;
  });

  activeFilterCount = $derived(this.activeFilterChips.length);

  sortChips = $derived.by(() =>
    this.sortRules.map((rule, index) => `#${index + 1} ${contactSortFieldLabelMap[rule.field]} ${rule.direction}`),
  );

  activeSortCount = $derived(this.sortRules.length);

  constructor() {
    void this.load();
  }

  load = async (): Promise<void> => {
    await Promise.all([this.loadContactGroups(), this.refreshCount()]);
  };

  updateSearch = (value: string): void => {
    this.search = value;
    this.scheduleRefresh();
  };

  toggleContactGroupFilter = (groupId: string): void => {
    this.selectedContactGroupIds = this.selectedContactGroupIds.includes(groupId)
      ? this.selectedContactGroupIds.filter((value) => value !== groupId)
      : [...this.selectedContactGroupIds, groupId];

    void this.refreshTable();
  };

  updateBirthdayAfter = (value: string): void => {
    this.birthdayAfter = value;
    void this.refreshTable();
  };

  updateEmailContains = (value: string): void => {
    this.emailContains = value;
    void this.refreshTable();
  };

  clearFilters = (): void => {
    this.selectedContactGroupIds = [];
    this.birthdayAfter = "";
    this.emailContains = "";
    void this.refreshTable();
  };

  addSortRule = (): void => {
    const usedFields = new Set(this.sortRules.map((rule) => rule.field));
    const field = this.sortFieldOptions.find((option) => !usedFields.has(option)) ?? this.sortFieldOptions[0];

    this.sortRules = [
      ...this.sortRules,
      {
        id: crypto.randomUUID(),
        field,
        direction: SortDirection.ASC,
      },
    ];

    void this.refreshTable();
  };

  removeSortRule = (ruleId: string): void => {
    const remaining = this.sortRules.filter((rule) => rule.id !== ruleId);
    this.sortRules =
      remaining.length > 0 ? remaining : [{ id: crypto.randomUUID(), field: "lastName", direction: SortDirection.ASC }];

    void this.refreshTable();
  };

  updateSortRuleField = (ruleId: string, field: ContactSortField): void => {
    this.sortRules = this.sortRules.map((rule) => (rule.id === ruleId ? { ...rule, field } : rule));
    void this.refreshTable();
  };

  updateSortRuleDirection = (ruleId: string, direction: SortDirection): void => {
    this.sortRules = this.sortRules.map((rule) => (rule.id === ruleId ? { ...rule, direction } : rule));
    void this.refreshTable();
  };

  clearSortRules = (): void => {
    this.sortRules = [{ id: crypto.randomUUID(), field: "lastName", direction: SortDirection.ASC }];
    void this.refreshTable();
  };

  openFilters = (): void => {
    this.filtersOpen = !this.filtersOpen;
    if (this.filtersOpen) {
      this.sortOpen = false;
    }
  };

  openSort = (): void => {
    this.sortOpen = !this.sortOpen;
    if (this.sortOpen) {
      this.filtersOpen = false;
    }
  };

  closeOverlays = (): void => {
    this.filtersOpen = false;
    this.sortOpen = false;
  };

  fetchRows = async (request: DataTableFetchRequest): Promise<DataTableFetchResult<ContactViewModel>> => {
    const pageRequest = buildContactRequest({
      pageSize: request.pageSize,
      cursor: request.kind === "cursor" ? request.cursor : null,
      direction: request.kind === "cursor" ? request.direction : undefined,
      offset: request.kind === "page" ? request.pageIndex * request.pageSize : undefined,
      search: this.search,
      contactGroupIds: this.selectedContactGroupIds,
      birthdayAfter: this.birthdayAfter,
      emailContains: this.emailContains,
      sortRules: this.sortRules,
    });

    try {
      const response = await fetchContacts(pageRequest, { credentials: "include" });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        return this.fetchMockRows(request);
      }

      this.loadingError = null;

      return {
        rows: (response.data.items ?? []).map((item, index) =>
          toContactViewModel(item, request.kind === "page" ? request.pageIndex * request.pageSize + index : index),
        ),
        nextCursor: response.data.nextCursor ?? null,
        prevCursor: response.data.prevCursor ?? null,
      };
    } catch {
      this.handleResponseError();
      return this.fetchMockRows(request);
    }
  };

  exportContacts = async (): Promise<void> => {
    if (this.exporting) {
      return;
    }

    this.exporting = true;
    this.actionMessage = null;

    try {
      const contacts = await this.loadAllContactsForExport();
      const blob = new Blob([toCsv(contacts, this.contactGroupNameById)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      this.actionMessage = `Exported ${contacts.length} contacts with current filters.`;
    } catch {
      this.actionMessage = "Could not export contacts.";
    } finally {
      this.exporting = false;
    }
  };

  importContacts = async (file: File): Promise<void> => {
    if (this.importing) {
      return;
    }

    this.importing = true;
    this.actionMessage = null;

    try {
      const uploadResponse = await getContactUploadUrl({ filename: file.name }, { credentials: "include" });

      if (uploadResponse.status !== 200) {
        this.actionMessage = (uploadResponse.data as ErrorResponse).errorDescription ?? "Could not start import.";
        return;
      }

      const uploadResult = await fetch(uploadResponse.data.url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "text/csv",
        },
        body: file,
      });

      if (!uploadResult.ok) {
        this.actionMessage = "Could not upload contacts file.";
        return;
      }

      this.actionMessage = `Imported ${uploadResponse.data.newFilename}.`;
      await this.refreshTable();
    } catch {
      this.actionMessage = "Could not import contacts.";
    } finally {
      this.importing = false;
    }
  };

  dispose = (): void => {
    if (!this.searchTimer) {
      return;
    }

    clearTimeout(this.searchTimer);
    this.searchTimer = null;
  };

  private scheduleRefresh(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    this.searchTimer = setTimeout(() => {
      void this.refreshTable();
    }, SEARCH_DEBOUNCE_MS);
  }

  private async refreshTable(): Promise<void> {
    this.tableKey += 1;
    await this.refreshCount();
  }

  private async refreshCount(): Promise<void> {
    const filter = buildContactFilter({
      search: this.search,
      contactGroupIds: this.selectedContactGroupIds,
      birthdayAfter: this.birthdayAfter,
      emailContains: this.emailContains,
    });

    try {
      const response = await countContacts(filter ?? {}, { credentials: "include" });

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        this.totalRows = this.filteredMockContacts.length;
        return;
      }

      this.loadingError = null;
      this.totalRows = response.data;
    } catch {
      this.handleResponseError();
      this.totalRows = this.filteredMockContacts.length;
    }
  }

  private async loadContactGroups(): Promise<void> {
    try {
      const response = await fetchContactGroups(
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

      this.contactGroups = response.data.items ?? [];
      this.contactGroupNameById = mergeContactGroupNames(this.contactGroupNameById, this.contactGroups);
    } catch {
      this.contactGroups = [];
    }
  }

  private get filteredMockContacts(): ContactViewModel[] {
    return sortContacts(
      filterMockContacts(
        this.fallbackContacts,
        this.search,
        this.selectedContactGroupIds,
        this.birthdayAfter,
        this.emailContains,
      ),
      this.sortRules,
    );
  }

  private fetchMockRows(request: DataTableFetchRequest): DataTableFetchResult<ContactViewModel> {
    const contacts = this.filteredMockContacts;
    const start = request.kind === "page" ? request.pageIndex * request.pageSize : 0;
    const rows = contacts.slice(start, start + request.pageSize);

    this.totalRows = contacts.length;

    return {
      rows,
      nextCursor: null,
      prevCursor: null,
    };
  }

  private async loadAllContactsForExport(): Promise<ContactViewModel[]> {
    const contacts: ContactViewModel[] = [];
    let cursor: unknown[] | null = null;

    for (let page = 0; page < MAX_EXPORT_PAGES; page += 1) {
      const response = await fetchContacts(
        buildContactRequest({
          pageSize: EXPORT_PAGE_SIZE,
          cursor,
          search: this.search,
          contactGroupIds: this.selectedContactGroupIds,
          birthdayAfter: this.birthdayAfter,
          emailContains: this.emailContains,
          sortRules: this.sortRules,
        }),
        { credentials: "include" },
      );

      if (response.status !== 200) {
        this.handleResponseError(response.data as ErrorResponse);
        return this.filteredMockContacts;
      }

      contacts.push(
        ...(response.data.items ?? []).map((item, index) => toContactViewModel(item, contacts.length + index)),
      );
      cursor = response.data.nextCursor ?? null;

      if (!cursor || (response.data.items?.length ?? 0) === 0) {
        break;
      }
    }

    return contacts;
  }

  private handleResponseError(error?: ErrorResponse): void {
    this.loadingError =
      error?.errorDescription ??
      "Could not load contacts from API. The page is showing local preview data until the backend responds.";
  }
}

function toCsv(contacts: ContactViewModel[], groupNameById: Record<string, string>): string {
  const header = ["First Name", "Last Name", "Phone Number", "Email", "Birthday", "Groups", "Notes"];
  const rows = contacts.map((contact) => [
    contact.firstName,
    contact.lastName,
    contact.phoneNumber,
    contact.email,
    contact.birthday,
    contact.contactGroupIds.map((groupId) => groupNameById[groupId] ?? groupId).join("; "),
    contact.notes,
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

function escapeCsvCell(value: string): string {
  if (!/[",\n]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}
