# Roadmap

This roadmap outlines planned improvements to agents, workflows, and skills for Claude Code orchestration.

## Current State

A curated distribution of Claude Code agents, workflows, and skills for building modern applications with Bun, Drizzle, and Hono. The project provides:

- **2 custom agents** (architect, code-reviewer) with focused checklists
- **5 workflow templates** (audit, migrate, research, loop-until-converged, judge-panel) implementing multi-agent orchestration patterns
- **6 quality patterns** (adversarial verify, perspective-diverse, dedup, judge-panel, cost-aware, phase-orchestration) as reusable techniques
- **3 domain skills** (Bun, Drizzle, Hono) teaching framework-specific patterns

## Planned Improvements

### Phase 1: Clarity & Education (High Impact)
Help teams adopt workflows and patterns faster.

- [ ] **Real project examples** — Full walk-throughs showing a workflow from start to finish (e.g., "audit TypeScript routes for auth, refactor findings, verify refactors against audit")
- [ ] **Memory flow documentation** — Guide for using persistent memory across workflow phases with before/after examples
- [ ] **Product/team context templates** — Help agents reason better by capturing team priorities (e.g., "we prioritize type safety", "compliance is non-negotiable")
- [ ] **Workflow decision tree** — When to use audit-codebase vs. loop-until-converged; how to compose workflows together

### Phase 2: Robustness & Composition (Medium Impact)
Build confidence in production use.

- [ ] **Error handling in templates** — Graceful degradation when agents return malformed output, files disappear, or budget runs out
- [ ] **Workflow composition guide** — Examples of stacking workflows or embedding patterns (e.g., perspective-diverse inside migrate-in-parallel)
- [ ] **Failure scenarios documentation** — Common failure modes and how agents should handle them

### Phase 3: Expertise Depth (Nice to Have)
Deepen domain knowledge in skills.

- [ ] **Edge cases in skills** — Drizzle migrations, schema versioning, circular relations; Bun workspaces and `bunfig.toml`; Hono route tree optimization
- [ ] **Anti-patterns guide** — What not to do with each framework; common gotchas
- [ ] **CLI helper for custom agents** — Questionnaire-driven tool to generate product/team-specific agent definitions

## Contributing

Contributions welcome! Please:

1. Follow the structure in `.agentic/` (agents, workflows, skills, rules are separate concerns)
2. Document new patterns in `.agentic/rules/patterns/`
3. Add new agents to `.agentic/agents/` with clear checklists
4. New workflows should include phase descriptions and example usage
5. Skills should include both patterns and gotchas, not just API reference

For questions, open an issue or PR.
