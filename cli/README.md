# Claude Code Agent Setup CLI

Interactive setup wizard for configuring Claude Code agents and workflows.

## What It Does

1. **Prompt for LLM provider** (Anthropic, OpenAI, etc)
2. **Select model** from that provider
3. **Enter API key** (stored locally in `.env`, never committed)
4. **Validate key** via a test API call
5. **Ask contextual questions** using the configured LLM
6. **Generate personalized agent context** based on answers
7. **Decide which skills to install** (Bun, Drizzle, Hono)
8. **Save configuration** to `.claude/config.json`

## Development

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

## Installation for Projects

After building:

```bash
npx @killallservers/agentic-cli setup
```

## Architecture

- **`src/index.ts`** — CLI entry point, orchestrates the setup flow
- **`src/llm/`** — LLM provider definitions and client
  - `providers.ts` — Supported providers and their models
  - `client.ts` — API client for Anthropic, OpenAI, etc
- **`src/prompts/`** — Ink UI components
  - `llm-setup.tsx` — Provider → Model → API Key flow
- **`src/utils/`** — Utilities
  - `env.ts` — Safe .env file writes
- **`src/types.ts`** — TypeScript interfaces

## Adding a New Provider

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
