#!/usr/bin/env bun

import { render } from 'ink'
import React from 'react'
import { LLMSetup } from './prompts/llm-setup'
import { LLMClient } from './llm/client'
import { type SetupConfig, buildFullConfig } from './types'
import { writeEnvKey, ensureGitignore, readEnvKey } from './utils/env'
import { loadConfig, saveConfig } from './config'
import { installScaffolding, runSymlinkHook } from './install'
import { AgentGeneratorPrompt } from './prompts/agent-generator'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (command === 'setup') {
    await runSetup()
  } else if (command === 'agent-generator' || command === 'create-agent') {
    await runAgentGenerator()
  } else {
    console.log('Usage: agentic <command>')
    console.log('Commands:')
    console.log('  setup              Interactive setup of agents and skills')
    console.log('  agent-generator    Create a custom agent from a questionnaire')
    console.log('  create-agent       Alias for agent-generator')
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

async function runAgentGenerator(): Promise<void> {
  console.log('\n🤖 Claude Code Custom Agent Generator\n')

  // Load config
  const config = loadConfig()
  if (!config) {
    console.error('❌ No LLM config found. Run `agentic setup` first.')
    process.exit(1)
  }

  const apiKey = readEnvKey(config.llm.provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY')
  if (!apiKey) {
    console.error('❌ No API key found in environment.')
    process.exit(1)
  }

  // Interactive prompt
  console.log('Answer a few questions to generate a personalized agent:\n')
  const { Component, waitForAnswer } = AgentGeneratorPrompt()
  const { unmount } = render(React.createElement(Component))

  const answers = await waitForAnswer()
  unmount()

  console.log('\n✨ Creating custom agent...\n')

  // Build agent definition
  const systemPrompt = buildSystemPrompt(answers)
  const checklist = buildChecklist(answers)

  const agentContent = `---
name: ${answers.name}
description: ${answers.role}
model: claude-haiku-4-5
tools: [Read, Grep, Write, Edit, Bash]
---

${systemPrompt}

## Review Checklist

${checklist}
`

  // Save to .agentic/agents/
  try {
    mkdirSync('.agentic/agents', { recursive: true })
    const filePath = join('.agentic/agents', `${answers.name}.md`)
    writeFileSync(filePath, agentContent)
    console.log(`✅ Agent created: ${filePath}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`❌ Failed to create agent: ${message}`)
    process.exit(1)
  }

  console.log(`\n🎉 Agent "${answers.name}" is ready to use!`)
  console.log(`\nEdit .agentic/agents/${answers.name}.md to customize further.`)
}

function buildSystemPrompt(answers: { name: string; role: string; teamSize: string; priority: string; stack: string; compliance?: string }): string {
  const priorityText: Record<string, string> = {
    speed: 'ship fast and iterate based on feedback',
    safety: 'minimize risk and maintain stability',
    learning: 'explain decisions and teach concepts',
    correctness: 'ensure high quality and type safety',
  }

  const stackContext: Record<string, string> = {
    frontend: 'frontend (React, TypeScript, UI/UX)',
    backend: 'backend (APIs, databases, business logic)',
    fullstack: 'full-stack (frontend + backend)',
    data: 'data/analytics (pipelines, transformations)',
  }

  const teamContext: Record<string, string> = {
    solo: 'a solo developer or small team (1-2 people)',
    small: 'a small team (2-5 people)',
    medium: 'a medium team (5-20 people)',
    large: 'a large organization (20+ people)',
  }

  return `You are a ${answers.role} for ${teamContext[answers.teamSize]} working on ${stackContext[answers.stack]}.

**Core principle:** Your job is to help the team ${priorityText[answers.priority]}.

**Team context:**
- Size: ${answers.teamSize}
- Priority: ${answers.priority}
- Tech stack: ${stackContext[answers.stack]}
${answers.compliance ? `- Compliance requirement: ${answers.compliance}` : ''}

When making recommendations, optimize for: ${getOptimizationOrder(answers.priority)}

**Key responsibility:** Make decisions that align with the team's values and constraints.`
}

function getOptimizationOrder(priority: string): string {
  const orders: Record<string, string> = {
    speed: 'Speed > Simplicity > Polish',
    safety: 'Safety > Compliance > Performance',
    learning: 'Understanding > Correctness > Speed',
    correctness: 'Correctness > Type Safety > Performance',
  }
  return orders[priority] || 'Correctness > Clarity > Simplicity'
}

function buildChecklist(answers: { priority: string }): string {
  const baseChecklist = `- [ ] Does this solve the stated problem?
- [ ] Are edge cases handled?
- [ ] Is the code readable and maintainable?`

  const priorityChecks: Record<string, string> = {
    speed: `${baseChecklist}
- [ ] Can this ship in the next sprint?
- [ ] Is this the simplest solution?
- [ ] Can we iterate on this if needed?`,
    safety: `${baseChecklist}
- [ ] Are all error cases handled?
- [ ] Does this maintain backwards compatibility?
- [ ] Have security implications been considered?
- [ ] Is this documented for future maintainers?`,
    learning: `${baseChecklist}
- [ ] Does this teach a concept?
- [ ] Are there alternative approaches documented?
- [ ] Is the reasoning behind decisions clear?
- [ ] Would a junior developer understand this?`,
    correctness: `${baseChecklist}
- [ ] Do all types check correctly?
- [ ] Is test coverage adequate?
- [ ] Does this handle all documented scenarios?
- [ ] Are there potential race conditions or deadlocks?`,
  }

  return priorityChecks[answers.priority] || baseChecklist
}

main().catch(console.error)
