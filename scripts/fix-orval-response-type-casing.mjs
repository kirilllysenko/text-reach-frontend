import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const API_DIR = path.resolve(process.cwd(), "src/lib/api");
const RESPONSE_TYPE_PATTERN = /\b[a-z][A-Za-z0-9_]*Response[A-Za-z0-9_]*\b/g;

const listTsFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listTsFiles(fullPath);
      }
      if (entry.isFile() && fullPath.endsWith(".ts")) {
        return [fullPath];
      }
      return [];
    }),
  );
  return files.flat();
};

const capitalizeFirst = (value) => value[0].toUpperCase() + value.slice(1);

const main = async () => {
  const files = await listTsFiles(API_DIR);

  await Promise.all(
    files.map(async (filePath) => {
      const content = await readFile(filePath, "utf8");
      const updated = content.replace(RESPONSE_TYPE_PATTERN, (match) => capitalizeFirst(match));
      if (updated !== content) {
        await writeFile(filePath, updated, "utf8");
      }
    }),
  );
};

await main();
