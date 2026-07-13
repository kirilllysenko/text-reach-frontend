import { Parser } from "@asyncapi/parser";
import { TypeScriptGenerator } from "@asyncapi/modelina";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { format, resolveConfig } from "prettier";

type JsonSchema = {
  $ref?: string;
  additionalProperties?: boolean | JsonSchema;
  const?: unknown;
  enum?: unknown[];
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
  format?: string;
  items?: JsonSchema;
  maxItems?: number;
  maxLength?: number;
  maxProperties?: number;
  maximum?: number;
  minItems?: number;
  minLength?: number;
  minProperties?: number;
  minimum?: number;
  multipleOf?: number;
  pattern?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  type?: string | string[];
  uniqueItems?: boolean;
};

type AsyncApiDocument = {
  asyncapi: string;
  channels?: Record<string, { messages?: Record<string, { $ref?: string }> }>;
  components?: {
    messages?: Record<string, { payload?: JsonSchema }>;
    schemas?: Record<string, JsonSchema>;
  };
  operations?: Record<
    string,
    {
      action?: "send" | "receive";
      channel?: { $ref?: string };
      messages?: Array<{ $ref?: string }>;
    }
  >;
};

const root = resolve(import.meta.dir, "..");
const inputPath = resolve(
  root,
  process.env.LIVE_UPDATE_ASYNCAPI_PATH ?? "../text-reach-backend/asyncapi/live-update.json",
);
const outputDirectory = resolve(root, "src/lib/live-update/generated");
const checkOnly = process.argv.includes("--check");

const source = await readFile(inputPath, "utf8");
const parsed = await new Parser().parse(source);
if (!parsed.document) {
  const diagnostics = parsed.diagnostics.map((diagnostic) => diagnostic.message).join("\n");
  throw new Error(`Invalid AsyncAPI document at ${inputPath}:\n${diagnostics}`);
}

const document = JSON.parse(source) as AsyncApiDocument;
const messages = document.components?.messages ?? {};
const schemas = document.components?.schemas ?? {};
const { clientMessages, serverMessages } = deriveMessageDirections(document, messages);
for (const required of ["Subscribe", "Unsubscribe", "Hello", "SubscriptionResult", "Change", "Error"]) {
  if (!messages[required]?.payload) throw new Error(`AsyncAPI component message ${required} is required`);
}
for (const required of ["LiveUpdateChannel", "LiveUpdateAction"]) {
  if (!schemas[required]) throw new Error(`AsyncAPI component schema ${required} is required`);
}

// Modelina is deliberately run against every public payload. Besides producing the model
// meta-model, this catches JSON Schema constructs unsupported by the TypeScript generator.
const modelina = new TypeScriptGenerator({ modelType: "interface" });
for (const [name, message] of Object.entries(messages)) {
  const payload = dereference(message.payload!, schemas);
  const generated = await modelina.generate({ ...payload, title: name });
  if (generated.length === 0) throw new Error(`Modelina could not generate the ${name} payload`);
}

const rawFiles = new Map<string, string>([
  ["types.ts", generateTypes(messages, schemas, clientMessages, serverMessages)],
  ["validators.ts", generateValidators(messages, schemas, clientMessages, serverMessages)],
  ["client.ts", generateClient()],
  ["index.ts", generateIndex()],
]);
const prettierConfig = (await resolveConfig(resolve(root, ".prettierrc"))) ?? {};
const files = new Map<string, string>();
for (const [name, content] of rawFiles) {
  files.set(
    name,
    await format(content, {
      ...prettierConfig,
      filepath: resolve(outputDirectory, name),
      parser: "typescript",
    }),
  );
}

if (checkOnly) {
  const existing = await readdir(outputDirectory).catch(() => [] as string[]);
  const expected = [...files.keys()].sort();
  if (JSON.stringify(existing.sort()) !== JSON.stringify(expected)) {
    throw new Error("Generated live-update file list is out of date; run bun run generate:live-update");
  }
  for (const [name, content] of files) {
    if ((await readFile(resolve(outputDirectory, name), "utf8")) !== content) {
      throw new Error(`${name} is out of date; run bun run generate:live-update`);
    }
  }
  console.log("Live-update generated contracts are up to date.");
} else {
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([...files].map(async ([name, content]) => writeFile(resolve(outputDirectory, name), content)));
  console.log(`Generated ${files.size} live-update contract files from ${inputPath}`);
}

function dereference(schema: JsonSchema, componentSchemas: Record<string, JsonSchema>): JsonSchema {
  if (schema.$ref) {
    const name = schema.$ref.split("/").at(-1)!;
    const referenced = componentSchemas[name];
    if (!referenced) throw new Error(`Unresolved schema reference ${schema.$ref}`);
    return dereference(referenced, componentSchemas);
  }
  return {
    ...schema,
    items: schema.items ? dereference(schema.items, componentSchemas) : undefined,
    properties: schema.properties
      ? Object.fromEntries(
          Object.entries(schema.properties).map(([name, property]) => [name, dereference(property, componentSchemas)]),
        )
      : undefined,
  };
}

function deriveMessageDirections(
  document: AsyncApiDocument,
  componentMessages: Record<string, { payload?: JsonSchema }>,
): { clientMessages: Set<string>; serverMessages: Set<string> } {
  const directions = new Map<string, Set<"send" | "receive">>();
  const operations = Object.entries(document.operations ?? {});
  if (operations.length === 0) throw new Error("AsyncAPI operations are required to derive message direction");

  for (const [operationName, operation] of operations) {
    if (operation.action !== "send" && operation.action !== "receive") {
      throw new Error(`AsyncAPI operation ${operationName} must declare a send or receive action`);
    }
    const channelName = operation.channel?.$ref?.match(/^#\/channels\/([^/]+)$/)?.[1];
    if (!channelName) throw new Error(`AsyncAPI operation ${operationName} must reference one local channel`);
    const channel = document.channels?.[channelName];
    if (!channel) throw new Error(`AsyncAPI operation ${operationName} references missing channel ${channelName}`);
    if (!operation.messages?.length) {
      throw new Error(`AsyncAPI operation ${operationName} must explicitly reference its messages`);
    }

    for (const messageReference of operation.messages) {
      const match = messageReference.$ref?.match(/^#\/channels\/([^/]+)\/messages\/([^/]+)$/);
      if (!match || match[1] !== channelName) {
        throw new Error(`AsyncAPI operation ${operationName} has an invalid message reference`);
      }
      const componentName = channel.messages?.[match[2]]?.$ref?.match(/^#\/components\/messages\/([^/]+)$/)?.[1];
      if (!componentName || !componentMessages[componentName]) {
        throw new Error(`AsyncAPI operation ${operationName} has an unresolved message reference`);
      }
      const actions = directions.get(componentName) ?? new Set<"send" | "receive">();
      actions.add(operation.action);
      directions.set(componentName, actions);
    }
  }

  for (const messageName of Object.keys(componentMessages)) {
    const actions = directions.get(messageName);
    if (!actions) throw new Error(`AsyncAPI message ${messageName} is not referenced by an operation`);
    if (actions.size !== 1) throw new Error(`AsyncAPI message ${messageName} has ambiguous direction`);
  }

  // AsyncAPI actions are from the server application's perspective: it receives client
  // commands and sends server notifications.
  return {
    clientMessages: new Set([...directions].filter(([, actions]) => actions.has("receive")).map(([name]) => name)),
    serverMessages: new Set([...directions].filter(([, actions]) => actions.has("send")).map(([name]) => name)),
  };
}

function schemaType(schema: JsonSchema): string {
  if (schema.$ref) return schema.$ref.split("/").at(-1)!;
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (schema.enum) return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  if (Array.isArray(schema.type)) {
    return schema.type.map((type) => schemaType({ ...schema, type })).join(" | ");
  }
  switch (schema.type) {
    case "array":
      return `ReadonlyArray<${schemaType(schema.items ?? {})}>`;
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "null":
      return "null";
    case "object":
      return "Record<string, unknown>";
    default:
      return "string";
  }
}

function constantName(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase() + "S";
}

function generateTypes(
  componentMessages: Record<string, { payload?: JsonSchema }>,
  componentSchemas: Record<string, JsonSchema>,
  clientMessages: ReadonlySet<string>,
  serverMessages: ReadonlySet<string>,
): string {
  const lines = [header()];
  for (const [name, schema] of Object.entries(componentSchemas)) {
    if (!schema.enum) continue;
    lines.push(
      `export const ${constantName(name)} = ${JSON.stringify(schema.enum, null, 2)} as const;`,
      `export type ${name} = (typeof ${constantName(name)})[number];`,
      "",
    );
  }
  for (const [name, message] of Object.entries(componentMessages)) {
    const payload = message.payload!;
    const required = new Set(payload.required ?? []);
    lines.push(`export interface ${name}Message {`);
    for (const [propertyName, property] of Object.entries(payload.properties ?? {})) {
      lines.push(`  ${propertyName}${required.has(propertyName) ? "" : "?"}: ${schemaType(property)};`);
    }
    lines.push("}", "");
  }
  const client = Object.keys(componentMessages).filter((name) => clientMessages.has(name));
  const server = Object.keys(componentMessages).filter((name) => serverMessages.has(name));
  lines.push(
    `export type LiveUpdateClientMessage = ${client.map((name) => `${name}Message`).join(" | ")};`,
    `export type LiveUpdateServerMessage = ${server.map((name) => `${name}Message`).join(" | ")};`,
    "",
  );
  return lines.join("\n");
}

function generateValidators(
  componentMessages: Record<string, { payload?: JsonSchema }>,
  componentSchemas: Record<string, JsonSchema>,
  clientMessages: ReadonlySet<string>,
  serverMessages: ReadonlySet<string>,
): string {
  const publicContract = JSON.stringify({ messages: componentMessages, schemas: componentSchemas }, null, 2);
  const clientTypes = Object.keys(componentMessages)
    .filter((name) => clientMessages.has(name))
    .map((name) => componentMessages[name]!.payload!.properties!.type!.const);
  const serverTypes = Object.keys(componentMessages)
    .filter((name) => serverMessages.has(name))
    .map((name) => componentMessages[name]!.payload!.properties!.type!.const);
  return `${header()}import type { LiveUpdateClientMessage, LiveUpdateServerMessage } from "./types";

const contract = ${publicContract} as const;
const clientTypes = new Set(${JSON.stringify(clientTypes)});
const serverTypes = new Set(${JSON.stringify(serverTypes)});

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
  const message = Object.values(contract.messages).find(
    ({ payload }) => payload.properties.type.const === value.type,
  );
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
    if (!Object.entries(properties).every(([name, property]) => !(name in value) || validateSchema(value[name], property))) {
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
`;
}

function generateClient(): string {
  return `${header()}import type {
  LiveUpdateChannel,
  LiveUpdateClientMessage,
  LiveUpdateServerMessage,
} from "./types";
import { parseLiveUpdateServerMessage } from "./validators";

export interface LiveUpdateClientOptions {
  url: string;
  protocols?: string | string[];
  onMessage: (message: LiveUpdateServerMessage) => void;
  onInvalidMessage?: (error: unknown, event: MessageEvent) => void;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  webSocketFactory?: (url: string, protocols?: string | string[]) => WebSocket;
}

export interface LiveUpdateClient {
  connect(): void;
  disconnect(code?: number, reason?: string): void;
  subscribe(channels: readonly LiveUpdateChannel[], requestId?: string): string;
  unsubscribe(channels: readonly LiveUpdateChannel[], requestId?: string): string;
  readonly readyState: number;
}

export function createLiveUpdateClient(options: LiveUpdateClientOptions): LiveUpdateClient {
  let socket: WebSocket | undefined;
  const factory = options.webSocketFactory ?? ((url, protocols) => new WebSocket(url, protocols));

  function send(message: LiveUpdateClientMessage): void {
    if (!socket || socket.readyState !== 1) throw new Error("Live-update WebSocket is not open");
    socket.send(JSON.stringify(message));
  }

  function command(type: "subscribe" | "unsubscribe", channels: readonly LiveUpdateChannel[], requestId?: string): string {
    const id = requestId ?? createRequestId();
    send({ type, requestId: id, channels: [...channels] });
    return id;
  }

  return {
    connect() {
      if (socket && (socket.readyState === 0 || socket.readyState === 1)) return;
      socket = factory(options.url, options.protocols);
      socket.onopen = (event) => options.onOpen?.(event);
      socket.onclose = (event) => options.onClose?.(event);
      socket.onmessage = (event) => {
        try {
          options.onMessage(parseLiveUpdateServerMessage(event.data));
        } catch (error) {
          options.onInvalidMessage?.(error, event);
        }
      };
    },
    disconnect(code, reason) {
      socket?.close(code, reason);
      socket = undefined;
    },
    subscribe: (channels, requestId) => command("subscribe", channels, requestId),
    unsubscribe: (channels, requestId) => command("unsubscribe", channels, requestId),
    get readyState() {
      return socket?.readyState ?? 3;
    },
  };
}

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? \`live-update-\${Date.now()}-\${Math.random().toString(16).slice(2)}\`;
}
`;
}

function generateIndex(): string {
  return `${header()}export * from "./client";
export * from "./types";
export * from "./validators";
`;
}

function header(): string {
  return "// Generated from the backend AsyncAPI contract. Do not edit.\n\n";
}
