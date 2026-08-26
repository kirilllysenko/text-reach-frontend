import { describe, expect, it } from "vitest";
import {
  conversationInitials,
  conversationPreview,
  conversationTitle,
  formatPhoneNumber,
  matchesConversation,
  type ConversationViewModel,
} from "./conversation-view-data";

function conversation(overrides: Partial<ConversationViewModel> = {}): ConversationViewModel {
  return {
    contact: {
      __typename: "Contact",
      firstName: "Avery",
      id: "01K00000000000000000000000",
      lastName: "Stone",
      phoneNumber: "+14155550123",
    },
    contactPhoneNumber: "+14155550123",
    id: "01K00000000000000000000001",
    lastMessage: {
      __typename: "Message",
      createdAt: "2026-08-17T12:00:00Z",
      direction: "INBOUND",
      id: "01K00000000000000000000002",
      media: [],
      status: "RECEIVED",
      text: "Can we reschedule?",
    },
    tenantPhoneNumber: "+14155550999",
    unreadCount: 1,
    updatedAt: "2026-08-17T12:00:00Z",
    ...overrides,
  };
}

describe("conversation view data", () => {
  it("uses a contact name and initials when available", () => {
    const value = conversation();
    expect(conversationTitle(value)).toBe("Avery Stone");
    expect(conversationInitials(value)).toBe("AS");
  });

  it("falls back to a formatted phone number", () => {
    const value = conversation({
      contact: {
        __typename: "Contact",
        firstName: null,
        id: "01K00000000000000000000000",
        lastName: null,
        phoneNumber: "+14155550123",
      },
    });
    expect(conversationTitle(value)).toBe("(415) 555-0123");
    expect(conversationInitials(value)).toBe("#");
    expect(formatPhoneNumber("+14155550123")).toBe("(415) 555-0123");
  });

  it("labels outbound text and media-only previews", () => {
    const outbound = conversation({
      lastMessage: {
        __typename: "Message",
        createdAt: "2026-08-17T12:00:00Z",
        direction: "OUTBOUND",
        id: "01K00000000000000000000002",
        media: [],
        status: "SENT",
        text: "See you then",
      },
    });
    const attachment = conversation({
      lastMessage: {
        __typename: "Message",
        createdAt: "2026-08-17T12:00:00Z",
        direction: "INBOUND",
        id: "01K00000000000000000000003",
        media: [
          {
            __typename: "MessageMedia",
            contentType: "application/pdf",
            url: "https://example.test/file.pdf",
          },
        ],
        status: "RECEIVED",
        text: "",
      },
    });
    expect(conversationPreview(outbound)).toBe("You: See you then");
    expect(conversationPreview(attachment)).toBe("Attachment");
  });

  it("searches names, phone numbers, and recent text case-insensitively", () => {
    const value = conversation();
    expect(matchesConversation(value, "avery")).toBe(true);
    expect(matchesConversation(value, "5550123")).toBe(true);
    expect(matchesConversation(value, "RESCHEDULE")).toBe(true);
    expect(matchesConversation(value, "missing")).toBe(false);
  });
});
