import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const ENV_PATH = resolve(".env");
const GITIGNORE_PATH = resolve(".gitignore");

export function writeEnvKey(key: string, value: string): void {
  const envContent = existsSync(ENV_PATH)
    ? readFileSync(ENV_PATH, "utf-8")
    : "";

  if (envContent.includes(`${key}=`)) {
    const updated = envContent
      .split("\n")
      .map((line) => (line.startsWith(`${key}=`) ? `${key}=${value}` : line))
      .join("\n");
    writeFileSync(ENV_PATH, updated);
  } else {
    const toAppend = envContent.endsWith("\n")
      ? `${key}=${value}\n`
      : `\n${key}=${value}\n`;
    appendFileSync(ENV_PATH, toAppend);
  }
}

export function ensureGitignore(): void {
  if (!existsSync(GITIGNORE_PATH)) {
    writeFileSync(GITIGNORE_PATH, ".env\n");
    return;
  }

  const content = readFileSync(GITIGNORE_PATH, "utf-8");
  if (!content.includes(".env")) {
    appendFileSync(GITIGNORE_PATH, ".env\n");
  }
}

export function readEnvKey(key: string): string | undefined {
  if (!existsSync(ENV_PATH)) return undefined;
  const content = readFileSync(ENV_PATH, "utf-8");
  const line = content.split("\n").find((l) => l.startsWith(`${key}=`));
  return line?.split("=")[1];
}
