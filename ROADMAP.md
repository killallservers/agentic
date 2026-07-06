# Roadmap

This roadmap outlines planned improvements to agents, workflows, and skills for Claude Code orchestration.

## 🎉 Status: All Phases Complete!

- ✅ **Phase 1: Clarity & Education** — 7 docs with real-world examples, personalization templates, decision tree
- ✅ **Phase 2: Robustness & Composition** — Error handling, failure recovery, workflow composition guide
- ✅ **Phase 3: Expertise Depth** — Edge cases in all skills, comprehensive anti-patterns guide

**Total additions:** 5000+ lines of documentation across 12 new files + 5 skill updates

## Current State

A curated distribution of Claude Code agents, workflows, and skills for building modern applications with Bun, Drizzle, and Hono. The project provides:

- **2 custom agents** (architect, code-reviewer) with focused checklists
- **5 workflow templates** (audit, migrate, research, loop-until-converged, judge-panel) implementing multi-agent orchestration patterns
- **6 quality patterns** (adversarial verify, perspective-diverse, dedup, judge-panel, cost-aware, phase-orchestration) as reusable techniques
- **3 domain skills** (Bun, Drizzle, Hono) teaching framework-specific patterns

## Planned Improvements

### Phase 1: Clarity & Education ✅ Complete
Help teams adopt workflows and patterns faster.

- [x] **Real project examples** — 4 complete walk-throughs: security audit, Drizzle migration, bug discovery, architecture decision
- [x] **Memory flow documentation** — Guide with 2 before/after patterns (audit→fix→verify, research→validate→synthesize)
- [x] **Product/team context templates** — 3 templates (startup, enterprise, learning) with system prompts and checklists
- [x] **Workflow decision tree** — Interactive guide covering all 6 workflows with cost, use cases, and customization

### Phase 2: Robustness & Composition ✅ Complete
Build confidence in production use.

- [x] **Error handling in templates** — Audit-codebase updated with try/catch, budget checks, graceful degradation
- [x] **Workflow composition guide** — 4 patterns (sequential, parallel, nested, loop+compose) with cost analysis
- [x] **Failure scenarios documentation** — 8 failure modes with recovery strategies documented

### Phase 3: Expertise Depth ✅ Complete
Deepen domain knowledge in skills.

- [x] **Edge cases in skills** — All 5 skills (Bun, Drizzle, Hono, BetterAuth, Biome) updated with edge cases
- [x] **Anti-patterns guide** — 25+ anti-patterns across domains with cost/symptom/fix table
- [x] **Workflow edge case documentation** — Comments added to workflow templates about limitations and optimizations

## Contributing

Contributions welcome! Please:

1. Follow the structure in `.agentic/` (agents, workflows, skills, rules are separate concerns)
2. Document new patterns in `.agentic/rules/patterns/`
3. Add new agents to `.agentic/agents/` with clear checklists
4. New workflows should include phase descriptions and example usage
5. Skills should include both patterns and gotchas, not just API reference

For questions, open an issue or PR.
