#!/usr/bin/env bun

import { render } from 'ink'
import React from 'react'
import { LLMSetup } from './prompts/llm-setup'
import { LLMClient } from './llm/client'
import { SetupConfig, buildFullConfig } from './types'
import { writeEnvKey, ensureGitignore, readEnvKey } from './utils/env'
import { loadConfig, saveConfig } from './config'
import { installScaffolding, runSymlinkHook } from './install'

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (command === 'setup') {
    await runSetup()
  } else {
    console.log('Usage: agentic setup')
  }
}

async function runSetup(): Promise<void> {
  console.log('\n🚀 Claude Code Agent Setup\n')

  // Check for existing config file
  const existingConfig = loadConfig()
  if (existingConfig) {
    console.log('✅ Found .config/agentic/config.toml')
    console.log(`Using provider: ${existingConfig.llm.provider}`)
    console.log(`Using model: ${existingConfig.llm.model}\n`)

    // Get API key from environment
    const apiKey = readEnvKey(
      existingConfig.llm.provider === 'anthropic'
        ? 'ANTHROPIC_API_KEY'
        : 'OPENAI_API_KEY'
    )
    if (!apiKey) {
      console.error('❌ API key not found in environment')
      process.exit(1)
    }

    const config: SetupConfig = {
      provider: existingConfig.llm.provider,
      model: existingConfig.llm.model,
      apiKey,
    }
    await continueSetup(config)
    return
  }

  // Check for existing API key
  const existingKey = readEnvKey('ANTHROPIC_API_KEY')
  if (existingKey) {
    console.log('✅ Found existing ANTHROPIC_API_KEY in .env\n')
    const config: SetupConfig = {
      provider: 'anthropic',
      model: 'claude-opus-4-8',
      apiKey: existingKey,
    }
    await continueSetup(config)
    return
  }

  // Show installation directory
  const cwd = process.cwd()
  console.log(`Installing to: ${cwd}`)
  console.log('Files will be created in .agentic/ and .claude/\n')

  const config = await getConfigFromUI()
  await continueSetup(config)
}

async function continueSetup(config: SetupConfig): Promise<void> {

  console.log('\n✅ Validating API key...\n')
  const client = new LLMClient(config)
  const isValid = await client.validateKey()

  if (!isValid) {
    console.error('❌ API key validation failed. Check your key and try again.')
    process.exit(1)
  }

  console.log('✅ API key valid!\n')
  const { getProvider } = await import('./llm/providers')
  const provider = getProvider(config.provider)
  if (provider) {
    writeEnvKey(provider.apiKeyEnvVar, config.apiKey)
  }
  ensureGitignore()

  console.log('📋 Asking contextual questions...\n')
  const answers = await client.askContextualQuestions()

  console.log('🤖 Generating personalized agent context...\n')
  const agentContext = await client.generateAgentContext(answers)

  console.log('📦 Deciding which skills to install...\n')
  const skills = await client.decideWhichSkills(answers)

  console.log('\n📂 Installing scaffolding...\n')
  const fullConfig = buildFullConfig(config, answers, skills, agentContext)
  await installScaffolding(fullConfig)

  console.log('\n🔗 Creating symlinks...\n')
  await runSymlinkHook()

  console.log('\n💾 Saving configuration...\n')
  saveConfig(fullConfig)

  console.log('\n✨ Setup complete!\n')
  console.log('Your agents, workflows, and skills are ready in .agentic/ and .claude/')
  console.log('Configuration saved to .config/agentic/config.toml')
  console.log('\nNext steps:')
  console.log('1. Configure memory: update .claude/settings.local.json')
  console.log('2. Read .agentic/AGENTS.md to learn about workflows and patterns')
  console.log('3. Try your first workflow: /audit-codebase or /judge-panel')
}

function getConfigFromUI(): Promise<SetupConfig> {
  return new Promise((resolve, reject) => {
    const { unmount } = render(
      React.createElement(LLMSetup, {
        onComplete: (cfg: SetupConfig) => {
          unmount()
          resolve(cfg)
        },
      })
    )
  })
}

main().catch(console.error)
