# Claude Code Skills & Agents Distribution

This repository contains a curated collection of Claude Code agents and skills for building modern applications with Bun, Drizzle, and Hono.

## Features

- **Custom Agents**: Pre-configured agents for architecture decisions and code review
- **Integrated Skills**: Specialized skills for Bun runtime, Drizzle ORM, and Hono framework
- **Automatic Symlinking**: Files in `.agentic/` are automatically symlinked to `.claude/` for seamless integration
- **Memory Management**: Built-in memory system for persistent context across sessions

## Installation

### Quick Start: Interactive Setup

```bash
curl -fsSL https://raw.githubusercontent.com/killallservers/agentic/main/setup.sh | bash
```

The interactive CLI will:
1. Prompt you to select an LLM provider (Anthropic, OpenAI, etc)
2. Choose a model
3. Enter your API key (stored securely in `.env`)
4. Ask contextual questions about your team and stack
5. Generate personalized agent context
6. Copy scaffolding files to `.agentic/` and create symlinks to `.claude/`
7. Save your configuration to `.config/agentic/config.toml`

### Manual Installation

Or clone and run locally:

```bash
git clone https://github.com/killallservers/agentic
cd agentic
bun install
bun run dev setup
```

### What Setup Does

The setup wizard automates three key steps:

1. **Configures your LLM provider** — Validates your API key and remembers which provider/model you chose
2. **Personalizes agents and workflows** — Asks about your team and tech stack, then customizes agent system prompts
3. **Installs scaffolding** — Copies agents, workflows, skills, and quality patterns to `.agentic/`, then syncs them to `.claude/` via symlinks

After setup completes, your Claude Code environment has:
- ✅ `.agentic/` — Source of truth for agents, workflows, skills, rules, and memory
- ✅ `.claude/` — Symlinked interface for Claude Code to read from
- ✅ `.env` — API key stored securely (add to `.gitignore`)
- ✅ `.config/agentic/config.toml` — Your setup configuration

## For Workflow-Driven Teams

If you're building multi-agent orchestrations, this repo is your starting point:

- **5 workflow templates** in `.agentic/workflows/` (audit, migrate, research, loop-until-converged, judge-panel)
- **6 quality patterns** in `.agentic/rules/` (adversarial verify, perspective-diverse, dedup, judge-panel, cost-aware, phase-orchestration)
- **Full documentation** in `.agentic/AGENTS.md` covering when to use each, how to customize, cost considerations

Workflows are **stack-agnostic**: the same audit template works on any codebase (Python, Go, TypeScript, etc). Skills teach domain expertise; workflows teach orchestration patterns.

See `.agentic/AGENTS.md` for the complete guide.

## Directory Structure

### `.agentic/` — Source of Truth

Contains all your Claude Code agents, workflows, skills, rules, and memory:

```
.agentic/
├── agents/          # Custom agent definitions (architect, code-reviewer)
├── workflows/       # Reusable orchestration templates (audit, judge-panel, etc)
├── skills/          # Stack-specific documentation (bun, drizzle, hono, biome)
├── rules/           # Security rules and quality patterns
│   ├── default.md   # Project security rules
│   └── patterns/    # Orchestration patterns (adversarial-verify, dedup, cost-aware)
├── memory/          # Memory boilerplate for persistent context across sessions
├── hooks/           # Utility scripts (symlink hook for .claude/ synchronization)
└── AGENTS.md        # Comprehensive guide to agents, workflows, and patterns
```

### `.claude/` — Claude Code Interface

Symlinked to `.agentic/` so Claude Code can read your agents, workflows, and skills. You don't edit files here—edit `.agentic/` and run the hook to sync:

```
.claude/
├── agents/          # Symlinks to .agentic/agents/
├── workflows/       # Symlinks to .agentic/workflows/
├── skills/          # Symlinks to .agentic/skills/
├── rules/           # Symlinks to .agentic/rules/
├── AGENTS.md        # Symlink to .agentic/AGENTS.md
├── settings.json    # Project-wide Claude Code settings (user-created)
└── settings.local.json  # Local overrides (gitignored, user-created)
```

### Why Symlinks?

Symlinks keep one source of truth (`.agentic/`) while letting Claude Code read from `.claude/` without file duplication. Benefits:
- **Single source:** Edit in `.agentic/`, automatically available to Claude Code
- **No duplication:** Agents, workflows, and skills aren't copied
- **Version control friendly:** Only `.agentic/` is committed; `.claude/` stays local
- **Portable:** Relative symlinks work regardless of where you clone the repo

### Hook System: Syncing `.agentic/` → `.claude/`

The symlink hook creates and maintains the symlinks. It runs automatically during setup, but you can invoke it manually when you:
- Add a new skill to `.agentic/skills/my-skill/SKILL.md`
- Create a new agent or workflow
- Reorganize files in `.agentic/`

**Manual invocation:**
```bash
bash .agentic/hooks/symlink-to-claude.sh
```

**From Claude Code** (if permissions granted):
```
! bash .agentic/hooks/symlink-to-claude.sh
```

For troubleshooting, see `.agentic/hooks/README.md`.

## Configuration

### Memory Directory Setup

To enable persistent memory across Claude Code sessions (recommended for workflows), update `.claude/settings.local.json`:

```json
{
  "autoMemoryDirectory": "~/.agentic/memory"
}
```

Memory persists context across workflow phases: phase 2 agents can reference phase 1 findings, etc.

### Config File

Your setup configuration is saved to `.config/agentic/config.toml` and includes:
- LLM provider and model
- Project metadata (name, description)
- Team information (priority, size, seniority)
- Tech stack (runtime, language, frameworks, ORM, database)
- Enabled skills, rules, and hooks

You can manually edit this file to reconfigure without running setup again.

## Project Structure

```
.agentic/
├── agents/          # Custom agent definitions
├── skills/          # Skill definitions (bun, drizzle, hono)
├── rules/           # Security rules and quality patterns
├── workflows/       # Workflow templates (audit, migrate, etc)
├── hooks/           # File synchronization hooks
└── memory/          # Memory storage (after configuration)

.claude/
├── settings.json    # Project-wide Claude Code settings
└── settings.local.json  # Local overrides (gitignored)

src/                 # Setup CLI (TypeScript/Bun)
├── index.ts         # CLI entry point
├── llm/             # LLM provider clients
├── prompts/         # Ink UI components
├── utils/           # Helper functions
├── types.ts         # TypeScript interfaces
└── init/            # Scaffolding files to copy on install
    ├── agents/      # Agent definitions
    ├── workflows/   # Workflow templates
    ├── rules/       # Security rules and patterns
    ├── memory/      # Memory boilerplate
    ├── hooks/       # Installation hooks
    └── skills/      # Optional skills (bun, drizzle, hono)

package.json, tsconfig.json, bun.lockb  # Setup CLI dependencies
```

## Available Agents

- **architect**: Systems architect for product design and architecture decisions
- **code-reviewer**: Code reviewer for PRs and implementation audits

## Available Skills

- **bun**: Fast JavaScript runtime and toolkit
- **drizzle**: Type-safe ORM for SQLite
- **hono**: Ultrafast web framework for APIs

## Setup CLI Development

The interactive setup wizard is built with Bun, TypeScript, and Ink (React terminal UI).

### Development

```bash
# Install dependencies
bun install

# Run setup locally
bun run dev setup

# Build for distribution
bun run build

# Run built CLI
bun dist/index.js setup
```

### CLI Architecture

- **`src/index.ts`** — CLI entry point, orchestrates the setup flow
- **`src/llm/`** — LLM provider definitions and client
  - `providers.ts` — Supported providers and their models
  - `client.ts` — API client for Anthropic, OpenAI, etc
- **`src/prompts/`** — Ink UI components
  - `llm-setup.tsx` — Provider → Model → API Key flow
- **`src/utils/`** — Utilities
  - `env.ts` — Safe .env file writes
- **`src/types.ts`** — TypeScript interfaces
- **`src/init/`** — Scaffolding templates
  - `core/` — Always installed
  - `skills/` — Conditionally installed

### Adding a New LLM Provider

1. Add to `PROVIDERS` in `src/llm/providers.ts`
2. Implement validation in `LLMClient` (add a `validate<Provider>Key()` method)
3. Implement API call in `LLMClient` (add a `call<Provider>()` method)

Example:

```typescript
export const PROVIDERS: Record<string, LLMProvider> = {
  // ... existing
  mistral: {
    name: 'Mistral',
    models: ['mistral-large', 'mistral-medium'],
    apiKeyEnvVar: 'MISTRAL_API_KEY',
  },
}
```

Then add validation and call methods in `client.ts`.

## License

See LICENSE file for details.
