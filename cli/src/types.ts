export interface LLMProvider {
  name: string
  models: string[]
  apiKeyEnvVar: string
}

export interface SetupConfig {
  provider: string
  model: string
  apiKey: string
  teamFocus?: string
  stack?: string[]
  projectName?: string
}

export interface LLMMessage {
  role: 'user' | 'assistant'
  content: string
}
