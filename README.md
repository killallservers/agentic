# Claude Code Skills & Agents Distribution

This repository contains a curated collection of Claude Code agents and skills for building modern applications with Bun, Drizzle, and Hono.

## Features

- **Custom Agents**: Pre-configured agents for architecture decisions and code review
- **Integrated Skills**: Specialized skills for Bun runtime, Drizzle ORM, and Hono framework
- **Automatic Symlinking**: Files in `.agentic/` are automatically symlinked to `.claude/` for seamless integration
- **Memory Management**: Built-in memory system for persistent context across sessions

## Installation

Run the installation script in your project directory:

```bash
curl -fsSL https://raw.githubusercontent.com/killallservers/skills/main/install.sh | bash
```

Or with custom repository/branch:

```bash
REPO="your-org/your-repo" BRANCH="main" bash install.sh
```

The script will:
- Sync agents and skills to your project
- Create or update `.gitignore` with Claude Code runtime entries
- Copy `TEMPLATE.md` to `README.md` if it doesn't exist

## For Workflow-Driven Teams

If you're building multi-agent orchestrations, this repo is your starting point:

- **5 workflow templates** in `.agentic/workflows/` (audit, migrate, research, loop-until-converged, judge-panel)
- **6 quality patterns** in `.agentic/rules/` (adversarial verify, perspective-diverse, dedup, judge-panel, cost-aware, phase-orchestration)
- **Full documentation** in `.agentic/AGENTS.md` covering when to use each, how to customize, cost considerations

Workflows are **stack-agnostic**: the same audit template works on any codebase (Python, Go, TypeScript, etc). Skills teach domain expertise; workflows teach orchestration patterns.

See `.agentic/AGENTS.md` for the complete guide.

## Configuration

### Memory Directory Setup

To enable persistent memory across Claude Code sessions (recommended for workflows), update `.claude/settings.local.json`:

```json
{
  "autoMemoryDirectory": "~/.agentic/memory"
}
```

Memory persists context across workflow phases: phase 2 agents can reference phase 1 findings, etc.

## Project Structure

```
.agentic/
├── agents/          # Custom agent definitions
├── skills/          # Skill definitions (bun, drizzle, hono)
├── rules/           # Security and access rules
├── hooks/           # File synchronization hooks
└── memory/          # Memory storage (after configuration)

.claude/
├── settings.json    # Project-wide Claude Code settings
└── settings.local.json  # Local overrides (gitignored)
```

## Available Agents

- **architect**: Systems architect for product design and architecture decisions
- **code-reviewer**: Code reviewer for PRs and implementation audits

## Available Skills

- **bun**: Fast JavaScript runtime and toolkit
- **drizzle**: Type-safe ORM for SQLite
- **hono**: Ultrafast web framework for APIs

## License

See LICENSE file for details.
