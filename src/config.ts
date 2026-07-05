import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'

export interface Config {
  llm: {
    provider: string
    model: string
  }
  project: {
    name: string
    description?: string
    created_at?: string
  }
  team: {
    priority: string
    size: string
    seniority: string
    existing_tools: string[]
  }
  stack: {
    runtime: string
    language: string
    frameworks: string[]
    orm: string
    database: string
    testing: string
    styling: string
    state_management: string
  }
  install: {
    project_root: string
    agentic_dir: string
    claude_dir: string
    skills: Record<string, boolean>
    rules: Record<string, boolean>
    hooks: Record<string, boolean>
  }
  agent_context?: {
    architect?: Record<string, any>
    code_reviewer?: Record<string, any>
  }
}

export function loadConfig(configPath?: string): Config | null {
  const path = configPath || resolve(process.cwd(), '.config/agentic/config.toml')

  if (!existsSync(path)) {
    return null
  }

  try {
    const content = readFileSync(path, 'utf-8')
    // For now, parse as JSON (TOML support can be added later)
    const config = JSON.parse(content) as Config
    return config
  } catch (error) {
    console.error(`Failed to parse config at ${path}:`, error)
    return null
  }
}

export function saveConfig(config: Config, configPath?: string): void {
  const path = configPath || resolve(process.cwd(), '.config/agentic/config.toml')
  const dir = dirname(path)

  mkdirSync(dir, { recursive: true })

  // Convert config to JSON (TOML serialization can be added later)
  const content = JSON.stringify(config, null, 2)
  writeFileSync(path, content)
}
