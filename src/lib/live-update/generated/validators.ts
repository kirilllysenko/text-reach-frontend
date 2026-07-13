// Generated from the backend AsyncAPI contract. Do not edit.

import type { LiveUpdateClientMessage, LiveUpdateServerMessage } from "./types";

const contract = {
  messages: {
    Change: {
      contentType: "application/json",
      name: "Change",
      payload: {
        additionalProperties: false,
        properties: {
          action: {
            $ref: "#/components/schemas/LiveUpdateAction",
          },
          channel: {
            $ref: "#/components/schemas/LiveUpdateChannel",
          },
          entityId: {
            type: ["string", "null"],
          },
          eventId: {
            type: "string",
          },
          occurredAt: {
            type: "string",
          },
          type: {
            const: "change",
            type: "string",
          },
        },
        required: ["type", "eventId", "channel", "action", "occurredAt"],
        type: "object",
      },
      title: "Change",
    },
    Error: {
      contentType: "application/json",
      name: "Error",
      payload: {
        additionalProperties: false,
        properties: {
          code: {
            type: "string",
          },
          message: {
            type: "string",
          },
          requestId: {
            type: ["string", "null"],
          },
          type: {
            const: "error",
            type: "string",
          },
        },
        required: ["type", "code", "message"],
        type: "object",
      },
      title: "Error",
    },
    Hello: {
      contentType: "application/json",
      name: "Hello",
      payload: {
        additionalProperties: false,
        properties: {
          heartbeatIntervalSeconds: {
            format: "uint64",
            minimum: 0,
            type: "integer",
          },
          protocolVersion: {
            format: "uint16",
            maximum: 65535,
            minimum: 0,
            type: "integer",
          },
          type: {
            const: "hello",
            type: "string",
          },
        },
        required: ["type", "protocolVersion", "heartbeatIntervalSeconds"],
        type: "object",
      },
      title: "Hello",
    },
    Subscribe: {
      contentType: "application/json",
      name: "Subscribe",
      payload: {
        additionalProperties: false,
        properties: {
          channels: {
            items: {
              $ref: "#/components/schemas/LiveUpdateChannel",
            },
            type: "array",
          },
          requestId: {
            type: "string",
          },
          type: {
            const: "subscribe",
            type: "string",
          },
        },
        required: ["type", "requestId", "channels"],
        type: "object",
      },
      title: "Subscribe",
    },
    SubscriptionResult: {
      contentType: "application/json",
      name: "SubscriptionResult",
      payload: {
        additionalProperties: false,
        properties: {
          accepted: {
            items: {
              $ref: "#/components/schemas/LiveUpdateChannel",
            },
            type: "array",
          },
          denied: {
            items: {
              $ref: "#/components/schemas/LiveUpdateChannel",
            },
            type: "array",
          },
          requestId: {
            type: "string",
          },
          type: {
            const: "subscriptionResult",
            type: "string",
          },
        },
        required: ["type", "requestId", "accepted", "denied"],
        type: "object",
      },
      title: "SubscriptionResult",
    },
    Unsubscribe: {
      contentType: "application/json",
      name: "Unsubscribe",
      payload: {
        additionalProperties: false,
        properties: {
          channels: {
            items: {
              $ref: "#/components/schemas/LiveUpdateChannel",
            },
            type: "array",
          },
          requestId: {
            type: "string",
          },
          type: {
            const: "unsubscribe",
            type: "string",
          },
        },
        required: ["type", "requestId", "channels"],
        type: "object",
      },
      title: "Unsubscribe",
    },
  },
  schemas: {
    LiveUpdateAction: {
      enum: ["created", "updated", "deleted", "invalidated"],
      type: "string",
    },
    LiveUpdateChannel: {
      enum: [
        "profile",
        "tenant-users",
        "contacts",
        "contact-groups",
        "custom-fields",
        "campaigns",
        "messages",
        "tenant-phones",
        "ten-dlc-brand",
        "ten-dlc-campaigns",
        "topups",
        "wallet",
        "wallet-transactions",
      ],
      type: "string",
    },
  },
} as const;
const clientTypes = new Set(["subscribe", "unsubscribe"]);
const serverTypes = new Set(["change", "error", "hello", "subscriptionResult"]);

export function isLiveUpdateClientMessage(value: unknown): value is LiveUpdateClientMessage {
  return isRecord(value) && typeof value.type === "string" && clientTypes.has(value.type) && validateMessage(value);
}

export function isLiveUpdateServerMessage(value: unknown): value is LiveUpdateServerMessage {
  return isRecord(value) && typeof value.type === "string" && serverTypes.has(value.type) && validateMessage(value);
}

export function parseLiveUpdateServerMessage(value: string | unknown): LiveUpdateServerMessage {
  const candidate: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!isLiveUpdateServerMessage(candidate)) throw new Error("Invalid live-update server message");
  return candidate;
}

function validateMessage(value: Record<string, unknown>): boolean {
  const message = Object.values(contract.messages).find(({ payload }) => payload.properties.type.const === value.type);
  return message !== undefined && validateSchema(value, message.payload);
}

function validateSchema(value: unknown, schema: Record<string, unknown>): boolean {
  if ("$ref" in schema) {
    const name = String(schema.$ref).split("/").at(-1)! as keyof typeof contract.schemas;
    return validateSchema(value, contract.schemas[name]);
  }
  if ("const" in schema && value !== schema.const) return false;
  if ("enum" in schema && !(schema.enum as readonly unknown[]).includes(value)) return false;
  const type = schema.type;
  if (Array.isArray(type)) return type.some((item) => validateSchema(value, { ...schema, type: item }));
  if (type === "null") return value === null;
  if (type === "string") {
    if (typeof value !== "string") return false;
    if (typeof schema.minLength === "number" && value.length < schema.minLength) return false;
    if (typeof schema.maxLength === "number" && value.length > schema.maxLength) return false;
    if (typeof schema.pattern === "string" && !new RegExp(schema.pattern).test(value)) return false;
    return typeof schema.format !== "string" || validateStringFormat(value, schema.format);
  }
  if (type === "integer" || type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) return false;
    if (type === "integer" && !Number.isInteger(value)) return false;
    if (typeof schema.minimum === "number" && value < schema.minimum) return false;
    if (typeof schema.maximum === "number" && value > schema.maximum) return false;
    if (typeof schema.exclusiveMinimum === "number" && value <= schema.exclusiveMinimum) return false;
    if (typeof schema.exclusiveMaximum === "number" && value >= schema.exclusiveMaximum) return false;
    if (typeof schema.multipleOf === "number" && value % schema.multipleOf !== 0) return false;
    return typeof schema.format !== "string" || validateNumericFormat(value, schema.format);
  }
  if (type === "boolean") return typeof value === "boolean";
  if (type === "array") {
    if (!Array.isArray(value)) return false;
    if (typeof schema.minItems === "number" && value.length < schema.minItems) return false;
    if (typeof schema.maxItems === "number" && value.length > schema.maxItems) return false;
    if (schema.uniqueItems === true && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) {
      return false;
    }
    return value.every((item) => validateSchema(item, schema.items as Record<string, unknown>));
  }
  if (type === "object") {
    if (!isRecord(value)) return false;
    const entries = Object.entries(value);
    if (typeof schema.minProperties === "number" && entries.length < schema.minProperties) return false;
    if (typeof schema.maxProperties === "number" && entries.length > schema.maxProperties) return false;
    const required = (schema.required ?? []) as readonly string[];
    if (!required.every((name) => name in value)) return false;
    const properties = (schema.properties ?? {}) as Record<string, Record<string, unknown>>;
    if (
      !Object.entries(properties).every(([name, property]) => !(name in value) || validateSchema(value[name], property))
    ) {
      return false;
    }
    const additional = entries.filter(([name]) => !(name in properties));
    if (schema.additionalProperties === false) return additional.length === 0;
    if (isRecord(schema.additionalProperties)) {
      return additional.every(([, property]) =>
        validateSchema(property, schema.additionalProperties as Record<string, unknown>),
      );
    }
    return true;
  }
  return true;
}

function validateStringFormat(value: string, format: string): boolean {
  if (format === "date-time") return !Number.isNaN(Date.parse(value));
  if (format === "uuid") {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }
  if (format === "uri") {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function validateNumericFormat(value: number, format: string): boolean {
  if (format === "uint16") return Number.isInteger(value) && value >= 0 && value <= 65_535;
  if (format === "uint32") return Number.isInteger(value) && value >= 0 && value <= 4_294_967_295;
  if (format === "uint64") return Number.isSafeInteger(value) && value >= 0;
  if (format === "int32") return Number.isInteger(value) && value >= -2_147_483_648 && value <= 2_147_483_647;
  if (format === "int64") return Number.isSafeInteger(value);
  if (format === "float" || format === "double") return Number.isFinite(value);
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
