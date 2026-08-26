/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query SidebarPhoneNumbers {\n  tenantPhones(first: 100, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n      }\n    }\n  }\n}": typeof types.SidebarPhoneNumbersDocument,
    "query CheckSession {\n  checkSession\n}": typeof types.CheckSessionDocument,
    "query ConversationMessage($id: Ulid!) {\n  message(id: $id) {\n    campaign {\n      id\n      name\n    }\n    conversation {\n      id\n    }\n    createdAt\n    direction\n    id\n    media {\n      contentType\n      sizeBytes\n      url\n    }\n    receivedAt\n    sentAt\n    status\n    text\n  }\n}": typeof types.ConversationMessageDocument,
    "query ConversationMessages($before: String, $filter: MessageFilterInput, $last: Int! = 100) {\n  messages(\n    before: $before\n    filter: $filter\n    last: $last\n    sortBy: [{createdAt: {direction: ASC}}, {id: {direction: ASC}}]\n  ) {\n    edges {\n      cursor\n      node {\n        campaign {\n          id\n          name\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        text\n      }\n    }\n    pageInfo {\n      hasPreviousPage\n      startCursor\n    }\n  }\n}": typeof types.ConversationMessagesDocument,
    "query Conversations($after: String, $filter: ConversationFilterInput, $first: Int! = 50) {\n  conversations(\n    after: $after\n    filter: $filter\n    first: $first\n    sortBy: [{updatedAt: {direction: DESC}}, {id: {direction: DESC}}]\n  ) {\n    edges {\n      cursor\n      node {\n        contact {\n          firstName\n          id\n          lastName\n          phoneNumber\n        }\n        contactPhoneNumber\n        id\n        lastMessage {\n          createdAt\n          direction\n          id\n          media {\n            contentType\n            url\n          }\n          status\n          text\n        }\n        tenantPhoneNumber\n        unreadCount\n        updatedAt\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}": typeof types.ConversationsDocument,
    "mutation MarkConversationRead($conversationId: Ulid!, $throughMessageId: Ulid) {\n  markConversationRead(\n    conversationId: $conversationId\n    throughMessageId: $throughMessageId\n  )\n}": typeof types.MarkConversationReadDocument,
    "query PaymentOverview {\n  walletBalance {\n    balanceUsdMicros\n    currency\n  }\n}": typeof types.PaymentOverviewDocument,
    "query Profile {\n  profile {\n    accessGroups\n    email\n    name\n  }\n}": typeof types.ProfileDocument,
    "mutation SendConversationMessage($input: SendConversationMessageInput!) {\n  sendConversationMessage(input: $input) {\n    campaign {\n      id\n      name\n    }\n    createdAt\n    direction\n    id\n    media {\n      contentType\n      sizeBytes\n      url\n    }\n    receivedAt\n    sentAt\n    status\n    text\n  }\n}": typeof types.SendConversationMessageDocument,
    "mutation SignOut {\n  signOut\n}": typeof types.SignOutDocument,
    "query TenantLifecycle {\n  tenantLifecycle {\n    accessMode\n    accountStatus\n    businessVerification\n    trialEndsAt\n  }\n}": typeof types.TenantLifecycleDocument,
    "query BusinessProfile {\n  businessProfile {\n    id\n    updatedAt\n    legalCompanyName\n    displayName\n    entityType\n    registrationCountry\n    hasTaxId\n    businessRegistrationType\n    taxIdIssuingCountry\n    taxIdLastFour\n    industry\n    address {\n      street\n      city\n      region\n      postalCode\n      country\n    }\n    website\n    businessPhone\n    businessEmail\n    authorizedContact {\n      firstName\n      lastName\n      title\n      phone\n      email\n    }\n    privacyPolicyUrl\n    termsOfServiceUrl\n  }\n}": typeof types.BusinessProfileDocument,
    "query BusinessProfileEdit {\n  businessProfile {\n    id\n    legalCompanyName\n    displayName\n    entityType\n    registrationCountry\n    hasTaxId\n    businessRegistrationType\n    taxIdIssuingCountry\n    taxIdLastFour\n    industry\n    address {\n      street\n      city\n      region\n      postalCode\n      country\n    }\n    website\n    businessPhone\n    businessEmail\n    authorizedContact {\n      firstName\n      lastName\n      title\n      phone\n      email\n    }\n    privacyPolicyUrl\n    termsOfServiceUrl\n  }\n}": typeof types.BusinessProfileEditDocument,
    "mutation UpsertBusinessProfile($input: BusinessProfileUpdateInput!) {\n  upsertBusinessProfile(input: $input) {\n    id\n    displayName\n    updatedAt\n  }\n}": typeof types.UpsertBusinessProfileDocument,
    "query CampaignFormContactGroups {\n  contactGroups(first: 300, sortBy: [{name: {direction: ASC}}]) {\n    edges {\n      node {\n        contactCount\n        id\n        name\n      }\n    }\n  }\n}": typeof types.CampaignFormContactGroupsDocument,
    "query CampaignFormSenderPhones {\n  tenantPhones(first: 300, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n      }\n    }\n  }\n}": typeof types.CampaignFormSenderPhonesDocument,
    "query CampaignMediaUploadUrl($filename: String!) {\n  campaignMediaUploadUrl(filename: $filename) {\n    mediaUrl\n    newFilename\n    uploadUrl\n  }\n}": typeof types.CampaignMediaUploadUrlDocument,
    "mutation CreateCampaign($input: CreateCampaignInput!) {\n  createCampaign(input: $input) {\n    id\n  }\n}": typeof types.CreateCampaignDocument,
    "query Campaigns($after: String, $filter: CampaignFilterInput, $first: Int, $sortBy: [CampaignSortInput!]! = []) {\n  campaigns(after: $after, filter: $filter, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        contactGroups {\n          id\n          name\n        }\n        id\n        messageCount\n        messageTemplate\n        name\n        scheduledAt\n        sentMessageCount\n        status\n        tenantPhone {\n          id\n          phoneNumber\n        }\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}": typeof types.CampaignsDocument,
    "query ExportMessages($after: String, $filter: MessageFilterInput, $first: Int!, $sortBy: [MessageSortByInput!]! = []) {\n  messages(after: $after, filter: $filter, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        campaign {\n          id\n        }\n        contact {\n          id\n        }\n        conversation {\n          id\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        tenantPhone {\n          id\n        }\n        tenantPhoneNumber\n        text\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}": typeof types.ExportMessagesDocument,
    "query Messages($after: String, $before: String, $filter: MessageFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [MessageSortByInput!]! = []) {\n  messages(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        campaign {\n          id\n        }\n        contact {\n          id\n        }\n        conversation {\n          id\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        tenantPhone {\n          id\n        }\n        tenantPhoneNumber\n        text\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}": typeof types.MessagesDocument,
    "mutation CancelCampaign($id: Ulid!) {\n  cancelCampaign(id: $id) {\n    id\n    status\n  }\n}": typeof types.CancelCampaignDocument,
    "mutation PauseCampaign($id: Ulid!) {\n  pauseCampaign(id: $id) {\n    id\n    status\n  }\n}": typeof types.PauseCampaignDocument,
    "mutation ResumeCampaign($id: Ulid!) {\n  resumeCampaign(id: $id) {\n    id\n    status\n  }\n}": typeof types.ResumeCampaignDocument,
    "mutation CreateContactGroup($input: ContactGroupWriteInput!) {\n  createContactGroup(input: $input)\n}": typeof types.CreateContactGroupDocument,
    "query ContactGroupFormEditQuery($id: Ulid!) {\n  contactGroup(id: $id) {\n    id\n    name\n  }\n}": typeof types.ContactGroupFormEditQueryDocument,
    "mutation UpdateContactGroup($id: Ulid!, $input: ContactGroupWriteInput!) {\n  updateContactGroup(id: $id, input: $input)\n}": typeof types.UpdateContactGroupDocument,
    "query ContactGroups($after: String, $before: String, $filter: ContactGroupFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [ContactGroupSortByInput!]! = []) {\n  contactGroups(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        id\n        contactCount\n        name\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}": typeof types.ContactGroupsDocument,
    "query ContactFormById($id: Ulid!) {\n  contact(id: $id) {\n    birthday\n    contactGroups {\n      id\n      name\n    }\n    customFields {\n      customField {\n        id\n      }\n      value\n    }\n    email\n    firstName\n    lastName\n    notes\n    phoneNumber\n  }\n}": typeof types.ContactFormByIdDocument,
    "query CustomFieldsQuery {\n  customFields {\n    fieldType\n    id\n    name\n  }\n}": typeof types.CustomFieldsQueryDocument,
    "mutation CreateContact($input: ContactWriteInput!) {\n  createContact(input: $input)\n}": typeof types.CreateContactDocument,
    "mutation UpdateContact($id: Ulid!, $input: ContactWriteInput!) {\n  updateContact(id: $id, input: $input)\n}": typeof types.UpdateContactDocument,
    "query ContactExportHistory($after: String, $first: Int!, $sortBy: [ContactExportSortInput!]! = [{createdAt: {direction: DESC}}]) {\n  contactExports(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        createdAt\n        fileSize\n        filename\n        id\n        processedRows\n        startedAt\n        status\n        totalRows\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}": typeof types.ContactExportHistoryDocument,
    "query ContactExportHistoryDownloadUrl($id: Ulid!) {\n  contactExportDownloadUrl(id: $id) {\n    url\n  }\n}": typeof types.ContactExportHistoryDownloadUrlDocument,
    "query ContactImportHistory($after: String, $first: Int!, $sortBy: [ContactImportSortInput!]! = [{createdAt: {direction: DESC}}]) {\n  contactImports(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        createdAt\n        filename\n        id\n        importedRows\n        processedRows\n        startedAt\n        status\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}": typeof types.ContactImportHistoryDocument,
    "query ContactTableQuery($after: String, $before: String, $filter: ContactFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [ContactSortByInput!]! = []) {\n  contacts(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        birthday\n        contactGroups {\n          id\n        }\n        email\n        firstName\n        id\n        lastName\n        notes\n        phoneNumber\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}": typeof types.ContactTableQueryDocument,
    "mutation DeleteContacts($filter: ContactFilterInput!) {\n  deleteContacts(filter: $filter)\n}": typeof types.DeleteContactsDocument,
    "mutation RequestContactExport($input: RequestContactExportInput!) {\n  requestContactExport(input: $input) {\n    contactExport {\n      id\n      status\n    }\n  }\n}": typeof types.RequestContactExportDocument,
    "query ContactGroupComboboxQuery($after: String, $before: String, $filter: ContactGroupFilterInput, $first: Int = 50, $last: Int, $sortBy: [ContactGroupSortByInput!]! = []) {\n  contactGroups(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n}": typeof types.ContactGroupComboboxQueryDocument,
    "query ContactImportCustomFieldsQuery {\n  customFields {\n    fieldType\n    id\n    name\n    position\n  }\n}": typeof types.ContactImportCustomFieldsQueryDocument,
    "mutation GenerateContactUploadUrl($filename: String!) {\n  generateContactUploadUrl(filename: $filename) {\n    newFilename\n    url\n  }\n}": typeof types.GenerateContactUploadUrlDocument,
    "mutation ImportContacts($input: ContactImportInput!) {\n  importContacts(input: $input) {\n    contactImport {\n      id\n      importedRows\n      status\n    }\n  }\n}": typeof types.ImportContactsDocument,
    "mutation CreateCustomField($input: CustomFieldWriteInput!) {\n  createCustomField(input: $input)\n}": typeof types.CreateCustomFieldDocument,
    "query CustomFieldFormEditQuery($id: Ulid!) {\n  customField(id: $id) {\n    fieldType\n    id\n    name\n  }\n}": typeof types.CustomFieldFormEditQueryDocument,
    "mutation UpdateCustomFieldName($id: Ulid!, $name: String!) {\n  updateCustomFieldName(id: $id, name: $name)\n}": typeof types.UpdateCustomFieldNameDocument,
    "query CustomFields {\n  customFields {\n    fieldType\n    id\n    name\n    position\n  }\n}": typeof types.CustomFieldsDocument,
    "mutation CreateTopupCheckoutSession($input: CreateTopupCheckoutSessionInput!) {\n  createTopupCheckoutSession(input: $input) {\n    amountUsdMicros\n    clientSecret\n    currency\n    stripeAmountCents\n    topup {\n      id\n      status\n    }\n  }\n}": typeof types.CreateTopupCheckoutSessionDocument,
    "query PaymentConfig {\n  paymentConfig {\n    currency\n    maxTopupUsdMicros\n    minTopupUsdMicros\n    stripePublishableKey\n  }\n}": typeof types.PaymentConfigDocument,
    "query WalletTransactions($after: String, $before: String, $filter: WalletTransactionFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [WalletTransactionSortByInput!]! = []) {\n  walletTransactions(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        amountUsdMicros\n        createdAt\n        currency\n        entryType\n        id\n        source {\n          __typename\n          id\n        }\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}": typeof types.WalletTransactionsDocument,
    "query TenDlcBrand {\n  tenDlcBrand {\n    id\n    name\n    providerStatus\n  }\n}": typeof types.TenDlcBrandDocument,
    "query TenDlcCampaigns {\n  tenDlcCampaigns(first: 50, sortBy: [{createdAt: {direction: DESC}}]) {\n    edges {\n      node {\n        id\n        description\n        providerStatus\n        usecase\n      }\n    }\n    totalCount\n  }\n}": typeof types.TenDlcCampaignsDocument,
    "mutation CreateTenDlcBrand($input: TenDlcBrandInput!) {\n  createTenDlcBrand(input: $input) {\n    id\n    name\n    providerStatus\n  }\n}": typeof types.CreateTenDlcBrandDocument,
    "query TenDlcBrandBusinessProfile {\n  businessProfile {\n    businessEmail\n    displayName\n    entityType\n    legalCompanyName\n    website\n  }\n}": typeof types.TenDlcBrandBusinessProfileDocument,
    "mutation CreateTenDlcCampaign($input: TenDlcCampaignInput!) {\n  createTenDlcCampaign(input: $input) {\n    id\n  }\n}": typeof types.CreateTenDlcCampaignDocument,
    "query TenDlcCampaignBrand {\n  tenDlcBrand {\n    id\n    name\n    providerStatus\n  }\n}": typeof types.TenDlcCampaignBrandDocument,
    "query TenDlcCampaignDocumentUploadUrl($filename: String!) {\n  campaignMediaUploadUrl(filename: $filename) {\n    mediaUrl\n    uploadUrl\n  }\n}": typeof types.TenDlcCampaignDocumentUploadUrlDocument,
    "query PhoneNumbers {\n  tenantPhones(first: 100, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n        phoneType\n      }\n    }\n    totalCount\n  }\n}": typeof types.PhoneNumbersDocument,
    "query AvailablePhoneNumbers($input: AvailableTenantPhonesInput!) {\n  availableTenantPhones(input: $input) {\n    phoneNumber\n    phoneType\n  }\n}": typeof types.AvailablePhoneNumbersDocument,
    "mutation BuyPhoneNumber($input: BuyTenantPhoneInput!) {\n  buyTenantPhone(input: $input) {\n    phoneNumber\n    phoneType\n  }\n}": typeof types.BuyPhoneNumberDocument,
    "mutation CreateShortCodeApplication($input: CreateShortCodeApplicationInput!) {\n  createShortCodeApplication(input: $input) {\n    id\n    requestedShortCode\n    shortCodeType\n    status\n  }\n}": typeof types.CreateShortCodeApplicationDocument,
    "query PhonePurchaseBusinessProfile {\n  businessProfile {\n    id\n    displayName\n    businessRegistrationType\n    entityType\n    hasTaxId\n    privacyPolicyUrl\n    taxIdIssuingCountry\n    termsOfServiceUrl\n    website\n  }\n}": typeof types.PhonePurchaseBusinessProfileDocument,
    "query PhonePurchaseTenDlcCampaigns {\n  tenDlcCampaigns(first: 50, sortBy: [{createdAt: {direction: DESC}}]) {\n    edges {\n      node {\n        id\n        description\n        providerStatus\n        usecase\n      }\n    }\n  }\n}": typeof types.PhonePurchaseTenDlcCampaignsDocument,
    "mutation ChangePassword($input: ChangePasswordInput!) {\n  changePassword(input: $input)\n}": typeof types.ChangePasswordDocument,
    "mutation ChangeProfileName($name: String) {\n  changeProfileName(name: $name)\n}": typeof types.ChangeProfileNameDocument,
    "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input)\n}": typeof types.CreateUserDocument,
    "query UserFormEditQuery($id: Ulid!) {\n  users(filter: {id: {in: [$id]}}, first: 1) {\n    edges {\n      node {\n        email\n        id\n        name\n        role\n      }\n    }\n  }\n}": typeof types.UserFormEditQueryDocument,
    "mutation UpdateUser($input: UpdateUserInput!) {\n  updateUser(input: $input)\n}": typeof types.UpdateUserDocument,
    "query Users($after: String, $first: Int, $sortBy: [TenantUserSortByInput!]! = []) {\n  users(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        id\n        email\n        name\n        role\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}": typeof types.UsersDocument,
    "mutation DeleteUser($id: Ulid!) {\n  deleteUser(id: $id)\n}": typeof types.DeleteUserDocument,
    "mutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input)\n}": typeof types.ResetPasswordDocument,
    "mutation SendPasswordResetCode($email: String!) {\n  sendPasswordResetCode(email: $email)\n}": typeof types.SendPasswordResetCodeDocument,
    "mutation SignIn($input: SignInInput!) {\n  signIn(input: $input)\n}": typeof types.SignInDocument,
    "query SignInSessionQuery {\n  checkSession\n}": typeof types.SignInSessionQueryDocument,
    "mutation SignUp($input: SignUpInput!) {\n  signUp(input: $input)\n}": typeof types.SignUpDocument,
    "mutation SendSignUpEmailCode($email: String!) {\n  sendSignUpEmailCode(email: $email)\n}": typeof types.SendSignUpEmailCodeDocument,
    "mutation SendSignUpPhoneCode($phoneNumber: String!) {\n  sendSignUpPhoneCode(phoneNumber: $phoneNumber)\n}": typeof types.SendSignUpPhoneCodeDocument,
};
const documents: Documents = {
    "query SidebarPhoneNumbers {\n  tenantPhones(first: 100, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n      }\n    }\n  }\n}": types.SidebarPhoneNumbersDocument,
    "query CheckSession {\n  checkSession\n}": types.CheckSessionDocument,
    "query ConversationMessage($id: Ulid!) {\n  message(id: $id) {\n    campaign {\n      id\n      name\n    }\n    conversation {\n      id\n    }\n    createdAt\n    direction\n    id\n    media {\n      contentType\n      sizeBytes\n      url\n    }\n    receivedAt\n    sentAt\n    status\n    text\n  }\n}": types.ConversationMessageDocument,
    "query ConversationMessages($before: String, $filter: MessageFilterInput, $last: Int! = 100) {\n  messages(\n    before: $before\n    filter: $filter\n    last: $last\n    sortBy: [{createdAt: {direction: ASC}}, {id: {direction: ASC}}]\n  ) {\n    edges {\n      cursor\n      node {\n        campaign {\n          id\n          name\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        text\n      }\n    }\n    pageInfo {\n      hasPreviousPage\n      startCursor\n    }\n  }\n}": types.ConversationMessagesDocument,
    "query Conversations($after: String, $filter: ConversationFilterInput, $first: Int! = 50) {\n  conversations(\n    after: $after\n    filter: $filter\n    first: $first\n    sortBy: [{updatedAt: {direction: DESC}}, {id: {direction: DESC}}]\n  ) {\n    edges {\n      cursor\n      node {\n        contact {\n          firstName\n          id\n          lastName\n          phoneNumber\n        }\n        contactPhoneNumber\n        id\n        lastMessage {\n          createdAt\n          direction\n          id\n          media {\n            contentType\n            url\n          }\n          status\n          text\n        }\n        tenantPhoneNumber\n        unreadCount\n        updatedAt\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}": types.ConversationsDocument,
    "mutation MarkConversationRead($conversationId: Ulid!, $throughMessageId: Ulid) {\n  markConversationRead(\n    conversationId: $conversationId\n    throughMessageId: $throughMessageId\n  )\n}": types.MarkConversationReadDocument,
    "query PaymentOverview {\n  walletBalance {\n    balanceUsdMicros\n    currency\n  }\n}": types.PaymentOverviewDocument,
    "query Profile {\n  profile {\n    accessGroups\n    email\n    name\n  }\n}": types.ProfileDocument,
    "mutation SendConversationMessage($input: SendConversationMessageInput!) {\n  sendConversationMessage(input: $input) {\n    campaign {\n      id\n      name\n    }\n    createdAt\n    direction\n    id\n    media {\n      contentType\n      sizeBytes\n      url\n    }\n    receivedAt\n    sentAt\n    status\n    text\n  }\n}": types.SendConversationMessageDocument,
    "mutation SignOut {\n  signOut\n}": types.SignOutDocument,
    "query TenantLifecycle {\n  tenantLifecycle {\n    accessMode\n    accountStatus\n    businessVerification\n    trialEndsAt\n  }\n}": types.TenantLifecycleDocument,
    "query BusinessProfile {\n  businessProfile {\n    id\n    updatedAt\n    legalCompanyName\n    displayName\n    entityType\n    registrationCountry\n    hasTaxId\n    businessRegistrationType\n    taxIdIssuingCountry\n    taxIdLastFour\n    industry\n    address {\n      street\n      city\n      region\n      postalCode\n      country\n    }\n    website\n    businessPhone\n    businessEmail\n    authorizedContact {\n      firstName\n      lastName\n      title\n      phone\n      email\n    }\n    privacyPolicyUrl\n    termsOfServiceUrl\n  }\n}": types.BusinessProfileDocument,
    "query BusinessProfileEdit {\n  businessProfile {\n    id\n    legalCompanyName\n    displayName\n    entityType\n    registrationCountry\n    hasTaxId\n    businessRegistrationType\n    taxIdIssuingCountry\n    taxIdLastFour\n    industry\n    address {\n      street\n      city\n      region\n      postalCode\n      country\n    }\n    website\n    businessPhone\n    businessEmail\n    authorizedContact {\n      firstName\n      lastName\n      title\n      phone\n      email\n    }\n    privacyPolicyUrl\n    termsOfServiceUrl\n  }\n}": types.BusinessProfileEditDocument,
    "mutation UpsertBusinessProfile($input: BusinessProfileUpdateInput!) {\n  upsertBusinessProfile(input: $input) {\n    id\n    displayName\n    updatedAt\n  }\n}": types.UpsertBusinessProfileDocument,
    "query CampaignFormContactGroups {\n  contactGroups(first: 300, sortBy: [{name: {direction: ASC}}]) {\n    edges {\n      node {\n        contactCount\n        id\n        name\n      }\n    }\n  }\n}": types.CampaignFormContactGroupsDocument,
    "query CampaignFormSenderPhones {\n  tenantPhones(first: 300, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n      }\n    }\n  }\n}": types.CampaignFormSenderPhonesDocument,
    "query CampaignMediaUploadUrl($filename: String!) {\n  campaignMediaUploadUrl(filename: $filename) {\n    mediaUrl\n    newFilename\n    uploadUrl\n  }\n}": types.CampaignMediaUploadUrlDocument,
    "mutation CreateCampaign($input: CreateCampaignInput!) {\n  createCampaign(input: $input) {\n    id\n  }\n}": types.CreateCampaignDocument,
    "query Campaigns($after: String, $filter: CampaignFilterInput, $first: Int, $sortBy: [CampaignSortInput!]! = []) {\n  campaigns(after: $after, filter: $filter, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        contactGroups {\n          id\n          name\n        }\n        id\n        messageCount\n        messageTemplate\n        name\n        scheduledAt\n        sentMessageCount\n        status\n        tenantPhone {\n          id\n          phoneNumber\n        }\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}": types.CampaignsDocument,
    "query ExportMessages($after: String, $filter: MessageFilterInput, $first: Int!, $sortBy: [MessageSortByInput!]! = []) {\n  messages(after: $after, filter: $filter, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        campaign {\n          id\n        }\n        contact {\n          id\n        }\n        conversation {\n          id\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        tenantPhone {\n          id\n        }\n        tenantPhoneNumber\n        text\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}": types.ExportMessagesDocument,
    "query Messages($after: String, $before: String, $filter: MessageFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [MessageSortByInput!]! = []) {\n  messages(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        campaign {\n          id\n        }\n        contact {\n          id\n        }\n        conversation {\n          id\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        tenantPhone {\n          id\n        }\n        tenantPhoneNumber\n        text\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}": types.MessagesDocument,
    "mutation CancelCampaign($id: Ulid!) {\n  cancelCampaign(id: $id) {\n    id\n    status\n  }\n}": types.CancelCampaignDocument,
    "mutation PauseCampaign($id: Ulid!) {\n  pauseCampaign(id: $id) {\n    id\n    status\n  }\n}": types.PauseCampaignDocument,
    "mutation ResumeCampaign($id: Ulid!) {\n  resumeCampaign(id: $id) {\n    id\n    status\n  }\n}": types.ResumeCampaignDocument,
    "mutation CreateContactGroup($input: ContactGroupWriteInput!) {\n  createContactGroup(input: $input)\n}": types.CreateContactGroupDocument,
    "query ContactGroupFormEditQuery($id: Ulid!) {\n  contactGroup(id: $id) {\n    id\n    name\n  }\n}": types.ContactGroupFormEditQueryDocument,
    "mutation UpdateContactGroup($id: Ulid!, $input: ContactGroupWriteInput!) {\n  updateContactGroup(id: $id, input: $input)\n}": types.UpdateContactGroupDocument,
    "query ContactGroups($after: String, $before: String, $filter: ContactGroupFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [ContactGroupSortByInput!]! = []) {\n  contactGroups(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        id\n        contactCount\n        name\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}": types.ContactGroupsDocument,
    "query ContactFormById($id: Ulid!) {\n  contact(id: $id) {\n    birthday\n    contactGroups {\n      id\n      name\n    }\n    customFields {\n      customField {\n        id\n      }\n      value\n    }\n    email\n    firstName\n    lastName\n    notes\n    phoneNumber\n  }\n}": types.ContactFormByIdDocument,
    "query CustomFieldsQuery {\n  customFields {\n    fieldType\n    id\n    name\n  }\n}": types.CustomFieldsQueryDocument,
    "mutation CreateContact($input: ContactWriteInput!) {\n  createContact(input: $input)\n}": types.CreateContactDocument,
    "mutation UpdateContact($id: Ulid!, $input: ContactWriteInput!) {\n  updateContact(id: $id, input: $input)\n}": types.UpdateContactDocument,
    "query ContactExportHistory($after: String, $first: Int!, $sortBy: [ContactExportSortInput!]! = [{createdAt: {direction: DESC}}]) {\n  contactExports(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        createdAt\n        fileSize\n        filename\n        id\n        processedRows\n        startedAt\n        status\n        totalRows\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}": types.ContactExportHistoryDocument,
    "query ContactExportHistoryDownloadUrl($id: Ulid!) {\n  contactExportDownloadUrl(id: $id) {\n    url\n  }\n}": types.ContactExportHistoryDownloadUrlDocument,
    "query ContactImportHistory($after: String, $first: Int!, $sortBy: [ContactImportSortInput!]! = [{createdAt: {direction: DESC}}]) {\n  contactImports(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        createdAt\n        filename\n        id\n        importedRows\n        processedRows\n        startedAt\n        status\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}": types.ContactImportHistoryDocument,
    "query ContactTableQuery($after: String, $before: String, $filter: ContactFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [ContactSortByInput!]! = []) {\n  contacts(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        birthday\n        contactGroups {\n          id\n        }\n        email\n        firstName\n        id\n        lastName\n        notes\n        phoneNumber\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}": types.ContactTableQueryDocument,
    "mutation DeleteContacts($filter: ContactFilterInput!) {\n  deleteContacts(filter: $filter)\n}": types.DeleteContactsDocument,
    "mutation RequestContactExport($input: RequestContactExportInput!) {\n  requestContactExport(input: $input) {\n    contactExport {\n      id\n      status\n    }\n  }\n}": types.RequestContactExportDocument,
    "query ContactGroupComboboxQuery($after: String, $before: String, $filter: ContactGroupFilterInput, $first: Int = 50, $last: Int, $sortBy: [ContactGroupSortByInput!]! = []) {\n  contactGroups(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n}": types.ContactGroupComboboxQueryDocument,
    "query ContactImportCustomFieldsQuery {\n  customFields {\n    fieldType\n    id\n    name\n    position\n  }\n}": types.ContactImportCustomFieldsQueryDocument,
    "mutation GenerateContactUploadUrl($filename: String!) {\n  generateContactUploadUrl(filename: $filename) {\n    newFilename\n    url\n  }\n}": types.GenerateContactUploadUrlDocument,
    "mutation ImportContacts($input: ContactImportInput!) {\n  importContacts(input: $input) {\n    contactImport {\n      id\n      importedRows\n      status\n    }\n  }\n}": types.ImportContactsDocument,
    "mutation CreateCustomField($input: CustomFieldWriteInput!) {\n  createCustomField(input: $input)\n}": types.CreateCustomFieldDocument,
    "query CustomFieldFormEditQuery($id: Ulid!) {\n  customField(id: $id) {\n    fieldType\n    id\n    name\n  }\n}": types.CustomFieldFormEditQueryDocument,
    "mutation UpdateCustomFieldName($id: Ulid!, $name: String!) {\n  updateCustomFieldName(id: $id, name: $name)\n}": types.UpdateCustomFieldNameDocument,
    "query CustomFields {\n  customFields {\n    fieldType\n    id\n    name\n    position\n  }\n}": types.CustomFieldsDocument,
    "mutation CreateTopupCheckoutSession($input: CreateTopupCheckoutSessionInput!) {\n  createTopupCheckoutSession(input: $input) {\n    amountUsdMicros\n    clientSecret\n    currency\n    stripeAmountCents\n    topup {\n      id\n      status\n    }\n  }\n}": types.CreateTopupCheckoutSessionDocument,
    "query PaymentConfig {\n  paymentConfig {\n    currency\n    maxTopupUsdMicros\n    minTopupUsdMicros\n    stripePublishableKey\n  }\n}": types.PaymentConfigDocument,
    "query WalletTransactions($after: String, $before: String, $filter: WalletTransactionFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [WalletTransactionSortByInput!]! = []) {\n  walletTransactions(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        amountUsdMicros\n        createdAt\n        currency\n        entryType\n        id\n        source {\n          __typename\n          id\n        }\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}": types.WalletTransactionsDocument,
    "query TenDlcBrand {\n  tenDlcBrand {\n    id\n    name\n    providerStatus\n  }\n}": types.TenDlcBrandDocument,
    "query TenDlcCampaigns {\n  tenDlcCampaigns(first: 50, sortBy: [{createdAt: {direction: DESC}}]) {\n    edges {\n      node {\n        id\n        description\n        providerStatus\n        usecase\n      }\n    }\n    totalCount\n  }\n}": types.TenDlcCampaignsDocument,
    "mutation CreateTenDlcBrand($input: TenDlcBrandInput!) {\n  createTenDlcBrand(input: $input) {\n    id\n    name\n    providerStatus\n  }\n}": types.CreateTenDlcBrandDocument,
    "query TenDlcBrandBusinessProfile {\n  businessProfile {\n    businessEmail\n    displayName\n    entityType\n    legalCompanyName\n    website\n  }\n}": types.TenDlcBrandBusinessProfileDocument,
    "mutation CreateTenDlcCampaign($input: TenDlcCampaignInput!) {\n  createTenDlcCampaign(input: $input) {\n    id\n  }\n}": types.CreateTenDlcCampaignDocument,
    "query TenDlcCampaignBrand {\n  tenDlcBrand {\n    id\n    name\n    providerStatus\n  }\n}": types.TenDlcCampaignBrandDocument,
    "query TenDlcCampaignDocumentUploadUrl($filename: String!) {\n  campaignMediaUploadUrl(filename: $filename) {\n    mediaUrl\n    uploadUrl\n  }\n}": types.TenDlcCampaignDocumentUploadUrlDocument,
    "query PhoneNumbers {\n  tenantPhones(first: 100, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n        phoneType\n      }\n    }\n    totalCount\n  }\n}": types.PhoneNumbersDocument,
    "query AvailablePhoneNumbers($input: AvailableTenantPhonesInput!) {\n  availableTenantPhones(input: $input) {\n    phoneNumber\n    phoneType\n  }\n}": types.AvailablePhoneNumbersDocument,
    "mutation BuyPhoneNumber($input: BuyTenantPhoneInput!) {\n  buyTenantPhone(input: $input) {\n    phoneNumber\n    phoneType\n  }\n}": types.BuyPhoneNumberDocument,
    "mutation CreateShortCodeApplication($input: CreateShortCodeApplicationInput!) {\n  createShortCodeApplication(input: $input) {\n    id\n    requestedShortCode\n    shortCodeType\n    status\n  }\n}": types.CreateShortCodeApplicationDocument,
    "query PhonePurchaseBusinessProfile {\n  businessProfile {\n    id\n    displayName\n    businessRegistrationType\n    entityType\n    hasTaxId\n    privacyPolicyUrl\n    taxIdIssuingCountry\n    termsOfServiceUrl\n    website\n  }\n}": types.PhonePurchaseBusinessProfileDocument,
    "query PhonePurchaseTenDlcCampaigns {\n  tenDlcCampaigns(first: 50, sortBy: [{createdAt: {direction: DESC}}]) {\n    edges {\n      node {\n        id\n        description\n        providerStatus\n        usecase\n      }\n    }\n  }\n}": types.PhonePurchaseTenDlcCampaignsDocument,
    "mutation ChangePassword($input: ChangePasswordInput!) {\n  changePassword(input: $input)\n}": types.ChangePasswordDocument,
    "mutation ChangeProfileName($name: String) {\n  changeProfileName(name: $name)\n}": types.ChangeProfileNameDocument,
    "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input)\n}": types.CreateUserDocument,
    "query UserFormEditQuery($id: Ulid!) {\n  users(filter: {id: {in: [$id]}}, first: 1) {\n    edges {\n      node {\n        email\n        id\n        name\n        role\n      }\n    }\n  }\n}": types.UserFormEditQueryDocument,
    "mutation UpdateUser($input: UpdateUserInput!) {\n  updateUser(input: $input)\n}": types.UpdateUserDocument,
    "query Users($after: String, $first: Int, $sortBy: [TenantUserSortByInput!]! = []) {\n  users(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        id\n        email\n        name\n        role\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}": types.UsersDocument,
    "mutation DeleteUser($id: Ulid!) {\n  deleteUser(id: $id)\n}": types.DeleteUserDocument,
    "mutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input)\n}": types.ResetPasswordDocument,
    "mutation SendPasswordResetCode($email: String!) {\n  sendPasswordResetCode(email: $email)\n}": types.SendPasswordResetCodeDocument,
    "mutation SignIn($input: SignInInput!) {\n  signIn(input: $input)\n}": types.SignInDocument,
    "query SignInSessionQuery {\n  checkSession\n}": types.SignInSessionQueryDocument,
    "mutation SignUp($input: SignUpInput!) {\n  signUp(input: $input)\n}": types.SignUpDocument,
    "mutation SendSignUpEmailCode($email: String!) {\n  sendSignUpEmailCode(email: $email)\n}": types.SendSignUpEmailCodeDocument,
    "mutation SendSignUpPhoneCode($phoneNumber: String!) {\n  sendSignUpPhoneCode(phoneNumber: $phoneNumber)\n}": types.SendSignUpPhoneCodeDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SidebarPhoneNumbers {\n  tenantPhones(first: 100, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n      }\n    }\n  }\n}"): (typeof documents)["query SidebarPhoneNumbers {\n  tenantPhones(first: 100, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CheckSession {\n  checkSession\n}"): (typeof documents)["query CheckSession {\n  checkSession\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ConversationMessage($id: Ulid!) {\n  message(id: $id) {\n    campaign {\n      id\n      name\n    }\n    conversation {\n      id\n    }\n    createdAt\n    direction\n    id\n    media {\n      contentType\n      sizeBytes\n      url\n    }\n    receivedAt\n    sentAt\n    status\n    text\n  }\n}"): (typeof documents)["query ConversationMessage($id: Ulid!) {\n  message(id: $id) {\n    campaign {\n      id\n      name\n    }\n    conversation {\n      id\n    }\n    createdAt\n    direction\n    id\n    media {\n      contentType\n      sizeBytes\n      url\n    }\n    receivedAt\n    sentAt\n    status\n    text\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ConversationMessages($before: String, $filter: MessageFilterInput, $last: Int! = 100) {\n  messages(\n    before: $before\n    filter: $filter\n    last: $last\n    sortBy: [{createdAt: {direction: ASC}}, {id: {direction: ASC}}]\n  ) {\n    edges {\n      cursor\n      node {\n        campaign {\n          id\n          name\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        text\n      }\n    }\n    pageInfo {\n      hasPreviousPage\n      startCursor\n    }\n  }\n}"): (typeof documents)["query ConversationMessages($before: String, $filter: MessageFilterInput, $last: Int! = 100) {\n  messages(\n    before: $before\n    filter: $filter\n    last: $last\n    sortBy: [{createdAt: {direction: ASC}}, {id: {direction: ASC}}]\n  ) {\n    edges {\n      cursor\n      node {\n        campaign {\n          id\n          name\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        text\n      }\n    }\n    pageInfo {\n      hasPreviousPage\n      startCursor\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Conversations($after: String, $filter: ConversationFilterInput, $first: Int! = 50) {\n  conversations(\n    after: $after\n    filter: $filter\n    first: $first\n    sortBy: [{updatedAt: {direction: DESC}}, {id: {direction: DESC}}]\n  ) {\n    edges {\n      cursor\n      node {\n        contact {\n          firstName\n          id\n          lastName\n          phoneNumber\n        }\n        contactPhoneNumber\n        id\n        lastMessage {\n          createdAt\n          direction\n          id\n          media {\n            contentType\n            url\n          }\n          status\n          text\n        }\n        tenantPhoneNumber\n        unreadCount\n        updatedAt\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}"): (typeof documents)["query Conversations($after: String, $filter: ConversationFilterInput, $first: Int! = 50) {\n  conversations(\n    after: $after\n    filter: $filter\n    first: $first\n    sortBy: [{updatedAt: {direction: DESC}}, {id: {direction: DESC}}]\n  ) {\n    edges {\n      cursor\n      node {\n        contact {\n          firstName\n          id\n          lastName\n          phoneNumber\n        }\n        contactPhoneNumber\n        id\n        lastMessage {\n          createdAt\n          direction\n          id\n          media {\n            contentType\n            url\n          }\n          status\n          text\n        }\n        tenantPhoneNumber\n        unreadCount\n        updatedAt\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation MarkConversationRead($conversationId: Ulid!, $throughMessageId: Ulid) {\n  markConversationRead(\n    conversationId: $conversationId\n    throughMessageId: $throughMessageId\n  )\n}"): (typeof documents)["mutation MarkConversationRead($conversationId: Ulid!, $throughMessageId: Ulid) {\n  markConversationRead(\n    conversationId: $conversationId\n    throughMessageId: $throughMessageId\n  )\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query PaymentOverview {\n  walletBalance {\n    balanceUsdMicros\n    currency\n  }\n}"): (typeof documents)["query PaymentOverview {\n  walletBalance {\n    balanceUsdMicros\n    currency\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Profile {\n  profile {\n    accessGroups\n    email\n    name\n  }\n}"): (typeof documents)["query Profile {\n  profile {\n    accessGroups\n    email\n    name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SendConversationMessage($input: SendConversationMessageInput!) {\n  sendConversationMessage(input: $input) {\n    campaign {\n      id\n      name\n    }\n    createdAt\n    direction\n    id\n    media {\n      contentType\n      sizeBytes\n      url\n    }\n    receivedAt\n    sentAt\n    status\n    text\n  }\n}"): (typeof documents)["mutation SendConversationMessage($input: SendConversationMessageInput!) {\n  sendConversationMessage(input: $input) {\n    campaign {\n      id\n      name\n    }\n    createdAt\n    direction\n    id\n    media {\n      contentType\n      sizeBytes\n      url\n    }\n    receivedAt\n    sentAt\n    status\n    text\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SignOut {\n  signOut\n}"): (typeof documents)["mutation SignOut {\n  signOut\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query TenantLifecycle {\n  tenantLifecycle {\n    accessMode\n    accountStatus\n    businessVerification\n    trialEndsAt\n  }\n}"): (typeof documents)["query TenantLifecycle {\n  tenantLifecycle {\n    accessMode\n    accountStatus\n    businessVerification\n    trialEndsAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query BusinessProfile {\n  businessProfile {\n    id\n    updatedAt\n    legalCompanyName\n    displayName\n    entityType\n    registrationCountry\n    hasTaxId\n    businessRegistrationType\n    taxIdIssuingCountry\n    taxIdLastFour\n    industry\n    address {\n      street\n      city\n      region\n      postalCode\n      country\n    }\n    website\n    businessPhone\n    businessEmail\n    authorizedContact {\n      firstName\n      lastName\n      title\n      phone\n      email\n    }\n    privacyPolicyUrl\n    termsOfServiceUrl\n  }\n}"): (typeof documents)["query BusinessProfile {\n  businessProfile {\n    id\n    updatedAt\n    legalCompanyName\n    displayName\n    entityType\n    registrationCountry\n    hasTaxId\n    businessRegistrationType\n    taxIdIssuingCountry\n    taxIdLastFour\n    industry\n    address {\n      street\n      city\n      region\n      postalCode\n      country\n    }\n    website\n    businessPhone\n    businessEmail\n    authorizedContact {\n      firstName\n      lastName\n      title\n      phone\n      email\n    }\n    privacyPolicyUrl\n    termsOfServiceUrl\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query BusinessProfileEdit {\n  businessProfile {\n    id\n    legalCompanyName\n    displayName\n    entityType\n    registrationCountry\n    hasTaxId\n    businessRegistrationType\n    taxIdIssuingCountry\n    taxIdLastFour\n    industry\n    address {\n      street\n      city\n      region\n      postalCode\n      country\n    }\n    website\n    businessPhone\n    businessEmail\n    authorizedContact {\n      firstName\n      lastName\n      title\n      phone\n      email\n    }\n    privacyPolicyUrl\n    termsOfServiceUrl\n  }\n}"): (typeof documents)["query BusinessProfileEdit {\n  businessProfile {\n    id\n    legalCompanyName\n    displayName\n    entityType\n    registrationCountry\n    hasTaxId\n    businessRegistrationType\n    taxIdIssuingCountry\n    taxIdLastFour\n    industry\n    address {\n      street\n      city\n      region\n      postalCode\n      country\n    }\n    website\n    businessPhone\n    businessEmail\n    authorizedContact {\n      firstName\n      lastName\n      title\n      phone\n      email\n    }\n    privacyPolicyUrl\n    termsOfServiceUrl\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpsertBusinessProfile($input: BusinessProfileUpdateInput!) {\n  upsertBusinessProfile(input: $input) {\n    id\n    displayName\n    updatedAt\n  }\n}"): (typeof documents)["mutation UpsertBusinessProfile($input: BusinessProfileUpdateInput!) {\n  upsertBusinessProfile(input: $input) {\n    id\n    displayName\n    updatedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CampaignFormContactGroups {\n  contactGroups(first: 300, sortBy: [{name: {direction: ASC}}]) {\n    edges {\n      node {\n        contactCount\n        id\n        name\n      }\n    }\n  }\n}"): (typeof documents)["query CampaignFormContactGroups {\n  contactGroups(first: 300, sortBy: [{name: {direction: ASC}}]) {\n    edges {\n      node {\n        contactCount\n        id\n        name\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CampaignFormSenderPhones {\n  tenantPhones(first: 300, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n      }\n    }\n  }\n}"): (typeof documents)["query CampaignFormSenderPhones {\n  tenantPhones(first: 300, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CampaignMediaUploadUrl($filename: String!) {\n  campaignMediaUploadUrl(filename: $filename) {\n    mediaUrl\n    newFilename\n    uploadUrl\n  }\n}"): (typeof documents)["query CampaignMediaUploadUrl($filename: String!) {\n  campaignMediaUploadUrl(filename: $filename) {\n    mediaUrl\n    newFilename\n    uploadUrl\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateCampaign($input: CreateCampaignInput!) {\n  createCampaign(input: $input) {\n    id\n  }\n}"): (typeof documents)["mutation CreateCampaign($input: CreateCampaignInput!) {\n  createCampaign(input: $input) {\n    id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Campaigns($after: String, $filter: CampaignFilterInput, $first: Int, $sortBy: [CampaignSortInput!]! = []) {\n  campaigns(after: $after, filter: $filter, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        contactGroups {\n          id\n          name\n        }\n        id\n        messageCount\n        messageTemplate\n        name\n        scheduledAt\n        sentMessageCount\n        status\n        tenantPhone {\n          id\n          phoneNumber\n        }\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}"): (typeof documents)["query Campaigns($after: String, $filter: CampaignFilterInput, $first: Int, $sortBy: [CampaignSortInput!]! = []) {\n  campaigns(after: $after, filter: $filter, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        contactGroups {\n          id\n          name\n        }\n        id\n        messageCount\n        messageTemplate\n        name\n        scheduledAt\n        sentMessageCount\n        status\n        tenantPhone {\n          id\n          phoneNumber\n        }\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ExportMessages($after: String, $filter: MessageFilterInput, $first: Int!, $sortBy: [MessageSortByInput!]! = []) {\n  messages(after: $after, filter: $filter, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        campaign {\n          id\n        }\n        contact {\n          id\n        }\n        conversation {\n          id\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        tenantPhone {\n          id\n        }\n        tenantPhoneNumber\n        text\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}"): (typeof documents)["query ExportMessages($after: String, $filter: MessageFilterInput, $first: Int!, $sortBy: [MessageSortByInput!]! = []) {\n  messages(after: $after, filter: $filter, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        campaign {\n          id\n        }\n        contact {\n          id\n        }\n        conversation {\n          id\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        tenantPhone {\n          id\n        }\n        tenantPhoneNumber\n        text\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Messages($after: String, $before: String, $filter: MessageFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [MessageSortByInput!]! = []) {\n  messages(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        campaign {\n          id\n        }\n        contact {\n          id\n        }\n        conversation {\n          id\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        tenantPhone {\n          id\n        }\n        tenantPhoneNumber\n        text\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}"): (typeof documents)["query Messages($after: String, $before: String, $filter: MessageFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [MessageSortByInput!]! = []) {\n  messages(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        campaign {\n          id\n        }\n        contact {\n          id\n        }\n        conversation {\n          id\n        }\n        createdAt\n        direction\n        id\n        media {\n          contentType\n          sizeBytes\n          url\n        }\n        receivedAt\n        sentAt\n        status\n        tenantPhone {\n          id\n        }\n        tenantPhoneNumber\n        text\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CancelCampaign($id: Ulid!) {\n  cancelCampaign(id: $id) {\n    id\n    status\n  }\n}"): (typeof documents)["mutation CancelCampaign($id: Ulid!) {\n  cancelCampaign(id: $id) {\n    id\n    status\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation PauseCampaign($id: Ulid!) {\n  pauseCampaign(id: $id) {\n    id\n    status\n  }\n}"): (typeof documents)["mutation PauseCampaign($id: Ulid!) {\n  pauseCampaign(id: $id) {\n    id\n    status\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ResumeCampaign($id: Ulid!) {\n  resumeCampaign(id: $id) {\n    id\n    status\n  }\n}"): (typeof documents)["mutation ResumeCampaign($id: Ulid!) {\n  resumeCampaign(id: $id) {\n    id\n    status\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateContactGroup($input: ContactGroupWriteInput!) {\n  createContactGroup(input: $input)\n}"): (typeof documents)["mutation CreateContactGroup($input: ContactGroupWriteInput!) {\n  createContactGroup(input: $input)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ContactGroupFormEditQuery($id: Ulid!) {\n  contactGroup(id: $id) {\n    id\n    name\n  }\n}"): (typeof documents)["query ContactGroupFormEditQuery($id: Ulid!) {\n  contactGroup(id: $id) {\n    id\n    name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateContactGroup($id: Ulid!, $input: ContactGroupWriteInput!) {\n  updateContactGroup(id: $id, input: $input)\n}"): (typeof documents)["mutation UpdateContactGroup($id: Ulid!, $input: ContactGroupWriteInput!) {\n  updateContactGroup(id: $id, input: $input)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ContactGroups($after: String, $before: String, $filter: ContactGroupFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [ContactGroupSortByInput!]! = []) {\n  contactGroups(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        id\n        contactCount\n        name\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}"): (typeof documents)["query ContactGroups($after: String, $before: String, $filter: ContactGroupFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [ContactGroupSortByInput!]! = []) {\n  contactGroups(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        id\n        contactCount\n        name\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ContactFormById($id: Ulid!) {\n  contact(id: $id) {\n    birthday\n    contactGroups {\n      id\n      name\n    }\n    customFields {\n      customField {\n        id\n      }\n      value\n    }\n    email\n    firstName\n    lastName\n    notes\n    phoneNumber\n  }\n}"): (typeof documents)["query ContactFormById($id: Ulid!) {\n  contact(id: $id) {\n    birthday\n    contactGroups {\n      id\n      name\n    }\n    customFields {\n      customField {\n        id\n      }\n      value\n    }\n    email\n    firstName\n    lastName\n    notes\n    phoneNumber\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CustomFieldsQuery {\n  customFields {\n    fieldType\n    id\n    name\n  }\n}"): (typeof documents)["query CustomFieldsQuery {\n  customFields {\n    fieldType\n    id\n    name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateContact($input: ContactWriteInput!) {\n  createContact(input: $input)\n}"): (typeof documents)["mutation CreateContact($input: ContactWriteInput!) {\n  createContact(input: $input)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateContact($id: Ulid!, $input: ContactWriteInput!) {\n  updateContact(id: $id, input: $input)\n}"): (typeof documents)["mutation UpdateContact($id: Ulid!, $input: ContactWriteInput!) {\n  updateContact(id: $id, input: $input)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ContactExportHistory($after: String, $first: Int!, $sortBy: [ContactExportSortInput!]! = [{createdAt: {direction: DESC}}]) {\n  contactExports(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        createdAt\n        fileSize\n        filename\n        id\n        processedRows\n        startedAt\n        status\n        totalRows\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}"): (typeof documents)["query ContactExportHistory($after: String, $first: Int!, $sortBy: [ContactExportSortInput!]! = [{createdAt: {direction: DESC}}]) {\n  contactExports(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        createdAt\n        fileSize\n        filename\n        id\n        processedRows\n        startedAt\n        status\n        totalRows\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ContactExportHistoryDownloadUrl($id: Ulid!) {\n  contactExportDownloadUrl(id: $id) {\n    url\n  }\n}"): (typeof documents)["query ContactExportHistoryDownloadUrl($id: Ulid!) {\n  contactExportDownloadUrl(id: $id) {\n    url\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ContactImportHistory($after: String, $first: Int!, $sortBy: [ContactImportSortInput!]! = [{createdAt: {direction: DESC}}]) {\n  contactImports(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        createdAt\n        filename\n        id\n        importedRows\n        processedRows\n        startedAt\n        status\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}"): (typeof documents)["query ContactImportHistory($after: String, $first: Int!, $sortBy: [ContactImportSortInput!]! = [{createdAt: {direction: DESC}}]) {\n  contactImports(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        createdAt\n        filename\n        id\n        importedRows\n        processedRows\n        startedAt\n        status\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ContactTableQuery($after: String, $before: String, $filter: ContactFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [ContactSortByInput!]! = []) {\n  contacts(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        birthday\n        contactGroups {\n          id\n        }\n        email\n        firstName\n        id\n        lastName\n        notes\n        phoneNumber\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}"): (typeof documents)["query ContactTableQuery($after: String, $before: String, $filter: ContactFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [ContactSortByInput!]! = []) {\n  contacts(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        birthday\n        contactGroups {\n          id\n        }\n        email\n        firstName\n        id\n        lastName\n        notes\n        phoneNumber\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeleteContacts($filter: ContactFilterInput!) {\n  deleteContacts(filter: $filter)\n}"): (typeof documents)["mutation DeleteContacts($filter: ContactFilterInput!) {\n  deleteContacts(filter: $filter)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation RequestContactExport($input: RequestContactExportInput!) {\n  requestContactExport(input: $input) {\n    contactExport {\n      id\n      status\n    }\n  }\n}"): (typeof documents)["mutation RequestContactExport($input: RequestContactExportInput!) {\n  requestContactExport(input: $input) {\n    contactExport {\n      id\n      status\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ContactGroupComboboxQuery($after: String, $before: String, $filter: ContactGroupFilterInput, $first: Int = 50, $last: Int, $sortBy: [ContactGroupSortByInput!]! = []) {\n  contactGroups(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n}"): (typeof documents)["query ContactGroupComboboxQuery($after: String, $before: String, $filter: ContactGroupFilterInput, $first: Int = 50, $last: Int, $sortBy: [ContactGroupSortByInput!]! = []) {\n  contactGroups(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query ContactImportCustomFieldsQuery {\n  customFields {\n    fieldType\n    id\n    name\n    position\n  }\n}"): (typeof documents)["query ContactImportCustomFieldsQuery {\n  customFields {\n    fieldType\n    id\n    name\n    position\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation GenerateContactUploadUrl($filename: String!) {\n  generateContactUploadUrl(filename: $filename) {\n    newFilename\n    url\n  }\n}"): (typeof documents)["mutation GenerateContactUploadUrl($filename: String!) {\n  generateContactUploadUrl(filename: $filename) {\n    newFilename\n    url\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ImportContacts($input: ContactImportInput!) {\n  importContacts(input: $input) {\n    contactImport {\n      id\n      importedRows\n      status\n    }\n  }\n}"): (typeof documents)["mutation ImportContacts($input: ContactImportInput!) {\n  importContacts(input: $input) {\n    contactImport {\n      id\n      importedRows\n      status\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateCustomField($input: CustomFieldWriteInput!) {\n  createCustomField(input: $input)\n}"): (typeof documents)["mutation CreateCustomField($input: CustomFieldWriteInput!) {\n  createCustomField(input: $input)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CustomFieldFormEditQuery($id: Ulid!) {\n  customField(id: $id) {\n    fieldType\n    id\n    name\n  }\n}"): (typeof documents)["query CustomFieldFormEditQuery($id: Ulid!) {\n  customField(id: $id) {\n    fieldType\n    id\n    name\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateCustomFieldName($id: Ulid!, $name: String!) {\n  updateCustomFieldName(id: $id, name: $name)\n}"): (typeof documents)["mutation UpdateCustomFieldName($id: Ulid!, $name: String!) {\n  updateCustomFieldName(id: $id, name: $name)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query CustomFields {\n  customFields {\n    fieldType\n    id\n    name\n    position\n  }\n}"): (typeof documents)["query CustomFields {\n  customFields {\n    fieldType\n    id\n    name\n    position\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateTopupCheckoutSession($input: CreateTopupCheckoutSessionInput!) {\n  createTopupCheckoutSession(input: $input) {\n    amountUsdMicros\n    clientSecret\n    currency\n    stripeAmountCents\n    topup {\n      id\n      status\n    }\n  }\n}"): (typeof documents)["mutation CreateTopupCheckoutSession($input: CreateTopupCheckoutSessionInput!) {\n  createTopupCheckoutSession(input: $input) {\n    amountUsdMicros\n    clientSecret\n    currency\n    stripeAmountCents\n    topup {\n      id\n      status\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query PaymentConfig {\n  paymentConfig {\n    currency\n    maxTopupUsdMicros\n    minTopupUsdMicros\n    stripePublishableKey\n  }\n}"): (typeof documents)["query PaymentConfig {\n  paymentConfig {\n    currency\n    maxTopupUsdMicros\n    minTopupUsdMicros\n    stripePublishableKey\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query WalletTransactions($after: String, $before: String, $filter: WalletTransactionFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [WalletTransactionSortByInput!]! = []) {\n  walletTransactions(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        amountUsdMicros\n        createdAt\n        currency\n        entryType\n        id\n        source {\n          __typename\n          id\n        }\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}"): (typeof documents)["query WalletTransactions($after: String, $before: String, $filter: WalletTransactionFilterInput, $first: Int, $last: Int, $offset: Int, $sortBy: [WalletTransactionSortByInput!]! = []) {\n  walletTransactions(\n    after: $after\n    before: $before\n    filter: $filter\n    first: $first\n    last: $last\n    offset: $offset\n    sortBy: $sortBy\n  ) {\n    edges {\n      node {\n        amountUsdMicros\n        createdAt\n        currency\n        entryType\n        id\n        source {\n          __typename\n          id\n        }\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query TenDlcBrand {\n  tenDlcBrand {\n    id\n    name\n    providerStatus\n  }\n}"): (typeof documents)["query TenDlcBrand {\n  tenDlcBrand {\n    id\n    name\n    providerStatus\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query TenDlcCampaigns {\n  tenDlcCampaigns(first: 50, sortBy: [{createdAt: {direction: DESC}}]) {\n    edges {\n      node {\n        id\n        description\n        providerStatus\n        usecase\n      }\n    }\n    totalCount\n  }\n}"): (typeof documents)["query TenDlcCampaigns {\n  tenDlcCampaigns(first: 50, sortBy: [{createdAt: {direction: DESC}}]) {\n    edges {\n      node {\n        id\n        description\n        providerStatus\n        usecase\n      }\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateTenDlcBrand($input: TenDlcBrandInput!) {\n  createTenDlcBrand(input: $input) {\n    id\n    name\n    providerStatus\n  }\n}"): (typeof documents)["mutation CreateTenDlcBrand($input: TenDlcBrandInput!) {\n  createTenDlcBrand(input: $input) {\n    id\n    name\n    providerStatus\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query TenDlcBrandBusinessProfile {\n  businessProfile {\n    businessEmail\n    displayName\n    entityType\n    legalCompanyName\n    website\n  }\n}"): (typeof documents)["query TenDlcBrandBusinessProfile {\n  businessProfile {\n    businessEmail\n    displayName\n    entityType\n    legalCompanyName\n    website\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateTenDlcCampaign($input: TenDlcCampaignInput!) {\n  createTenDlcCampaign(input: $input) {\n    id\n  }\n}"): (typeof documents)["mutation CreateTenDlcCampaign($input: TenDlcCampaignInput!) {\n  createTenDlcCampaign(input: $input) {\n    id\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query TenDlcCampaignBrand {\n  tenDlcBrand {\n    id\n    name\n    providerStatus\n  }\n}"): (typeof documents)["query TenDlcCampaignBrand {\n  tenDlcBrand {\n    id\n    name\n    providerStatus\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query TenDlcCampaignDocumentUploadUrl($filename: String!) {\n  campaignMediaUploadUrl(filename: $filename) {\n    mediaUrl\n    uploadUrl\n  }\n}"): (typeof documents)["query TenDlcCampaignDocumentUploadUrl($filename: String!) {\n  campaignMediaUploadUrl(filename: $filename) {\n    mediaUrl\n    uploadUrl\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query PhoneNumbers {\n  tenantPhones(first: 100, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n        phoneType\n      }\n    }\n    totalCount\n  }\n}"): (typeof documents)["query PhoneNumbers {\n  tenantPhones(first: 100, sortBy: [{phoneNumber: {direction: ASC}}]) {\n    edges {\n      node {\n        id\n        phoneNumber\n        phoneType\n      }\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query AvailablePhoneNumbers($input: AvailableTenantPhonesInput!) {\n  availableTenantPhones(input: $input) {\n    phoneNumber\n    phoneType\n  }\n}"): (typeof documents)["query AvailablePhoneNumbers($input: AvailableTenantPhonesInput!) {\n  availableTenantPhones(input: $input) {\n    phoneNumber\n    phoneType\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation BuyPhoneNumber($input: BuyTenantPhoneInput!) {\n  buyTenantPhone(input: $input) {\n    phoneNumber\n    phoneType\n  }\n}"): (typeof documents)["mutation BuyPhoneNumber($input: BuyTenantPhoneInput!) {\n  buyTenantPhone(input: $input) {\n    phoneNumber\n    phoneType\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateShortCodeApplication($input: CreateShortCodeApplicationInput!) {\n  createShortCodeApplication(input: $input) {\n    id\n    requestedShortCode\n    shortCodeType\n    status\n  }\n}"): (typeof documents)["mutation CreateShortCodeApplication($input: CreateShortCodeApplicationInput!) {\n  createShortCodeApplication(input: $input) {\n    id\n    requestedShortCode\n    shortCodeType\n    status\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query PhonePurchaseBusinessProfile {\n  businessProfile {\n    id\n    displayName\n    businessRegistrationType\n    entityType\n    hasTaxId\n    privacyPolicyUrl\n    taxIdIssuingCountry\n    termsOfServiceUrl\n    website\n  }\n}"): (typeof documents)["query PhonePurchaseBusinessProfile {\n  businessProfile {\n    id\n    displayName\n    businessRegistrationType\n    entityType\n    hasTaxId\n    privacyPolicyUrl\n    taxIdIssuingCountry\n    termsOfServiceUrl\n    website\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query PhonePurchaseTenDlcCampaigns {\n  tenDlcCampaigns(first: 50, sortBy: [{createdAt: {direction: DESC}}]) {\n    edges {\n      node {\n        id\n        description\n        providerStatus\n        usecase\n      }\n    }\n  }\n}"): (typeof documents)["query PhonePurchaseTenDlcCampaigns {\n  tenDlcCampaigns(first: 50, sortBy: [{createdAt: {direction: DESC}}]) {\n    edges {\n      node {\n        id\n        description\n        providerStatus\n        usecase\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ChangePassword($input: ChangePasswordInput!) {\n  changePassword(input: $input)\n}"): (typeof documents)["mutation ChangePassword($input: ChangePasswordInput!) {\n  changePassword(input: $input)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ChangeProfileName($name: String) {\n  changeProfileName(name: $name)\n}"): (typeof documents)["mutation ChangeProfileName($name: String) {\n  changeProfileName(name: $name)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input)\n}"): (typeof documents)["mutation CreateUser($input: CreateUserInput!) {\n  createUser(input: $input)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query UserFormEditQuery($id: Ulid!) {\n  users(filter: {id: {in: [$id]}}, first: 1) {\n    edges {\n      node {\n        email\n        id\n        name\n        role\n      }\n    }\n  }\n}"): (typeof documents)["query UserFormEditQuery($id: Ulid!) {\n  users(filter: {id: {in: [$id]}}, first: 1) {\n    edges {\n      node {\n        email\n        id\n        name\n        role\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation UpdateUser($input: UpdateUserInput!) {\n  updateUser(input: $input)\n}"): (typeof documents)["mutation UpdateUser($input: UpdateUserInput!) {\n  updateUser(input: $input)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Users($after: String, $first: Int, $sortBy: [TenantUserSortByInput!]! = []) {\n  users(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        id\n        email\n        name\n        role\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}"): (typeof documents)["query Users($after: String, $first: Int, $sortBy: [TenantUserSortByInput!]! = []) {\n  users(after: $after, first: $first, sortBy: $sortBy) {\n    edges {\n      node {\n        id\n        email\n        name\n        role\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n    totalCount\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation DeleteUser($id: Ulid!) {\n  deleteUser(id: $id)\n}"): (typeof documents)["mutation DeleteUser($id: Ulid!) {\n  deleteUser(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input)\n}"): (typeof documents)["mutation ResetPassword($input: ResetPasswordInput!) {\n  resetPassword(input: $input)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SendPasswordResetCode($email: String!) {\n  sendPasswordResetCode(email: $email)\n}"): (typeof documents)["mutation SendPasswordResetCode($email: String!) {\n  sendPasswordResetCode(email: $email)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SignIn($input: SignInInput!) {\n  signIn(input: $input)\n}"): (typeof documents)["mutation SignIn($input: SignInInput!) {\n  signIn(input: $input)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SignInSessionQuery {\n  checkSession\n}"): (typeof documents)["query SignInSessionQuery {\n  checkSession\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SignUp($input: SignUpInput!) {\n  signUp(input: $input)\n}"): (typeof documents)["mutation SignUp($input: SignUpInput!) {\n  signUp(input: $input)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SendSignUpEmailCode($email: String!) {\n  sendSignUpEmailCode(email: $email)\n}"): (typeof documents)["mutation SendSignUpEmailCode($email: String!) {\n  sendSignUpEmailCode(email: $email)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation SendSignUpPhoneCode($phoneNumber: String!) {\n  sendSignUpPhoneCode(phoneNumber: $phoneNumber)\n}"): (typeof documents)["mutation SendSignUpPhoneCode($phoneNumber: String!) {\n  sendSignUpPhoneCode(phoneNumber: $phoneNumber)\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;