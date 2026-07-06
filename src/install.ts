import { execSync } from "node:child_process";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Config } from "./config";

const VERSION = "0.1.1";

const SCAFFOLD_FILES = [
  "README.md",
  "AGENTS.md",
  "ROADMAP.md",
  "rules/default.md",
  "rules/patterns/dedup.md",
  "rules/patterns/judge-panel.md",
  "rules/patterns/adversarial-verify.md",
  "rules/patterns/phase-orchestration.md",
  "rules/patterns/perspective-diverse.md",
  "rules/patterns/cost-aware.md",
  "agents/code-reviewer.md",
  "agents/architect.md",
  "workflows/audit-codebase.js",
  "workflows/judge-panel.js",
  "workflows/loop-until-converged.js",
  "workflows/migrate-in-parallel.js",
  "workflows/research-question.js",
  "memory/MEMORY.md",
  "memory/subagents_workflows.md",
  "skills/bun/SKILL.md",
  "skills/biome/SKILL.md",
  "skills/drizzle/SKILL.md",
  "skills/hono/SKILL.md",
  "hooks/symlink-to-claude.sh",
];

async function fetchFile(path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/killallservers/agentic/v${VERSION}/templates/${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }
  return response.text();
}

export async function installScaffolding(_config: Config): Promise<void> {
  const targetDir = resolve(".agentic");

  console.log(`📥 Fetching scaffolding files (v${VERSION})...`);

  for (const file of SCAFFOLD_FILES) {
    const filePath = resolve(targetDir, file);
    const fileDir = dirname(filePath);

    // Skip if file already exists (don't overwrite user edits)
    try {
      statSync(filePath);
      continue;
    } catch {
      // File doesn't exist; proceed to create it
    }

    // Create directory if it doesn't exist
    mkdirSync(fileDir, { recursive: true });

    try {
      const content = await fetchFile(file);
      writeFileSync(filePath, content);
    } catch (error) {
      console.error(`⚠️  Failed to fetch ${file}:`, error);
      throw error;
    }
  }

  console.log("✅ Scaffolding installed to .agentic/");
}

export async function runSymlinkHook(): Promise<void> {
  try {
    const hookPath = resolve(".agentic/hooks/symlink-to-claude.sh");
    execSync(`bash "${hookPath}"`, { stdio: "inherit" });
    console.log("✅ Symlink hook completed");
  } catch (error) {
    console.error(
      "⚠️  Symlink hook failed. You can run it manually later with:",
    );
    console.error("   bash .agentic/hooks/symlink-to-claude.sh");
    throw error;
  }
}
