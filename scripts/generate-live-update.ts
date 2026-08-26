import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

interface Reference {
  $ref: string;
}

interface Operation {
  messages?: Reference[];
}

interface AsyncApiContract {
  channels?: Record<string, { messages?: Record<string, Reference> }>;
  components?: {
    messages?: Record<string, unknown>;
    schemas?: Record<string, { enum?: string[] }>;
  };
  operations?: Record<string, Operation>;
}

const projectRoot = resolve(import.meta.dir, "..");
const contractPath = resolve(
  process.env.LIVE_UPDATE_ASYNCAPI_PATH ?? resolve(projectRoot, "../text-reach-backend/asyncapi/live-update.json"),
);
const generatedTypesPath = resolve(projectRoot, "src/lib/live-update/generated/types.ts");

const contract = JSON.parse(await readFile(contractPath, "utf8")) as AsyncApiContract;
const clientMessages = operationMessages(contract, "clientMessages");
const serverMessages = operationMessages(contract, "serverMessages");

for (const message of clientMessages) {
  if (serverMessages.has(message)) {
    throw new Error(`${message} has ambiguous direction`);
  }
}

const declaredMessages = new Set(Object.keys(contract.components?.messages ?? {}));
for (const message of [...clientMessages, ...serverMessages]) {
  if (!declaredMessages.has(message)) {
    throw new Error(`${message} is not declared under components.messages`);
  }
}

await verifyGeneratedTypes(contract, [...clientMessages, ...serverMessages]);

function operationMessages(source: AsyncApiContract, operationName: string): Set<string> {
  const operation = source.operations?.[operationName];
  if (!operation?.messages?.length) {
    throw new Error(`${operationName} must explicitly reference its messages`);
  }

  return new Set(operation.messages.map((reference) => referenceName(reference.$ref)));
}

function referenceName(reference: string): string {
  const name = reference.split("/").at(-1);
  if (!name) {
    throw new Error(`Invalid AsyncAPI reference: ${reference}`);
  }
  return name;
}

async function verifyGeneratedTypes(source: AsyncApiContract, messages: string[]): Promise<void> {
  const generatedTypes = await readFile(generatedTypesPath, "utf8");
  const enumValues = Object.values(source.components?.schemas ?? {}).flatMap((schema) => schema.enum ?? []);
  const missingValues = enumValues.filter((value) => !generatedTypes.includes(JSON.stringify(value)));
  const missingMessages = messages.filter((message) => !generatedTypes.includes(`interface ${message}Message`));

  if (missingValues.length > 0 || missingMessages.length > 0) {
    throw new Error(
      `Generated live-update types are out of date: ${[...missingValues, ...missingMessages].join(", ")}`,
    );
  }
}
