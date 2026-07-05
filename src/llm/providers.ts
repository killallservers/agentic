import { LLMProvider } from '../types'

export const PROVIDERS: Record<string, LLMProvider> = {
  anthropic: {
    name: 'Anthropic',
    models: [
      'claude-opus-4-8',
      'claude-sonnet-5',
      'claude-haiku-4-5-20251001',
    ],
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
  },
  openai: {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
    apiKeyEnvVar: 'OPENAI_API_KEY',
  },
}

export function getProvider(
  key: string
): LLMProvider | undefined {
  return PROVIDERS[key]
}

export function listProviders(): Array<{ label: string; value: string }> {
  return Object.entries(PROVIDERS).map(([key, provider]) => ({
    label: provider.name,
    value: key,
  }))
}
