#!/usr/bin/env bun

import { render } from 'ink'
import React from 'react'
import { AgentGeneratorPrompt } from './prompts/agent-generator'
import { loadConfig } from './config'
import { readEnvKey } from './utils/env'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

interface AgentAnswers {
  name: string
  role: string
  teamSize: 'solo' | 'small' | 'medium' | 'large'
  priority: 'speed' | 'safety' | 'learning' | 'correctness'
  stack: 'frontend' | 'backend' | 'fullstack' | 'data'
  compliance?: string
}

async function main() {
  console.log('\n🤖 Claude Code Custom Agent Generator\n')

  // Load LLM config
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

  // Collect answers via interactive prompt
  console.log('Answer a few questions to generate a personalized agent:\n')

  const { Component, waitForAnswer } = AgentGeneratorPrompt()
  const { unmount } = render(React.createElement(Component))

  const answers = await waitForAnswer()
  unmount()

  console.log('\n✨ Generating custom agent...\n')

  // Build agent definition based on answers
  const systemPrompt = buildSystemPrompt(answers)
  const checklist = buildChecklist(answers)

  // Create agent markdown
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

  // Symlink to .claude/
  try {
    console.log('📁 Syncing to .claude/ directory...')
    const { execSync } = await import('child_process')
    execSync('bash .agentic/hooks/symlink-to-claude.sh', { stdio: 'inherit' })
    console.log('✅ Agent symlinked to .claude/agents/')
  } catch (err) {
    console.warn('⚠️  Could not sync symlinks. Run: bash .agentic/hooks/symlink-to-claude.sh')
  }

  console.log(`\n🎉 Agent "${answers.name}" is ready to use!`)
  console.log(`\nEdit .agentic/agents/${answers.name}.md to customize further.`)
}

function buildSystemPrompt(answers: AgentAnswers): string {
  const priorityText = {
    speed: 'ship fast and iterate based on feedback',
    safety: 'minimize risk and maintain stability',
    learning: 'explain decisions and teach concepts',
    correctness: 'ensure high quality and type safety',
  }

  const stackContext = {
    frontend: 'frontend (React, TypeScript, UI/UX)',
    backend: 'backend (APIs, databases, business logic)',
    fullstack: 'full-stack (frontend + backend)',
    data: 'data/analytics (pipelines, transformations)',
  }

  const teamContext = {
    solo: 'a solo developer or small team (1-2 people)',
    small: 'a small team (2-5 people)',
    medium: 'a medium team (5-20 people)',
    large: 'a large organization (20+ people)',
  }

  const basePrompt = `You are a ${answers.role} for ${teamContext[answers.teamSize]} working on ${stackContext[answers.stack]}.

**Core principle:** Your job is to help the team ${priorityText[answers.priority]}.

**Team context:**
- Size: ${answers.teamSize}
- Priority: ${answers.priority}
- Tech stack: ${stackContext[answers.stack]}
${answers.compliance ? `- Compliance requirement: ${answers.compliance}` : ''}

When making recommendations, optimize for: ${getOptimizationOrder(answers.priority)}

**Key responsibility:** Make decisions that align with the team's values and constraints.`

  return basePrompt
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

function buildChecklist(answers: AgentAnswers): string {
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
