# Kill All Servers: Skills Repository

This repository hosts a collection of reusable Claude Code skills for building modern web applications. Each skill is production-ready documentation with setup guides, patterns, and examples.

## What This Is

A distribution package for Claude Code skills that extends Claude's capabilities for specific tools and frameworks:
- **Bun** — Fast JavaScript runtime and all-in-one toolchain
- **Hono** — Lightweight web framework for APIs
- **Drizzle** — Type-safe ORM for databases

Skills are stored in `.agentic/skills/` and installed via `install.sh` into downstream projects.

## Installation

```bash
bash install.sh
```

This script:
1. Discovers all skills in `.agentic/skills/`
2. Downloads each skill's `SKILL.md` file
3. Creates symlinks in `.claude/skills/` for Claude Code discovery
4. Initializes `.claude/settings.json` and updates `.gitignore`

## Project Structure

```
.agentic/
├── agents/           # Custom Claude Code subagents
├── rules/            # Security & behavior rules
├── settings.json     # Shared Claude Code configuration
└── skills/           # Reusable skill packages (the main product)

.claude/
├── CLAUDE.md         # This file
├── settings.json     # Inherited from .agentic/ or configured locally
├── commands/         # Custom /slash-commands
├── hooks/            # Automation scripts
└── docs/             # Reference documentation
```

## Development

To add a new skill:
1. Create `.agentic/skills/your-skill/SKILL.md` with YAML frontmatter
2. Include setup, patterns, and concrete examples
3. Test via `install.sh`
4. Commit to main

To modify configuration:
- Update `.agentic/settings.json` for team-wide rules (commit)
- Update `.agentic/rules/default.md` for security policy (commit)
- Update `.agentic/agents/` for custom subagents (commit)

## License

MIT — See LICENSE file
