import type { SetupConfig, LLMMessage } from '../types'
import { getProvider } from './providers'

export class LLMClient {
  private config: SetupConfig

  constructor(config: SetupConfig) {
    this.config = config
  }

  async validateKey(): Promise<boolean> {
    try {
      if (this.config.provider === 'anthropic') {
        return await this.validateAnthropicKey()
      } else if (this.config.provider === 'openai') {
        return await this.validateOpenAIKey()
      }
      return false
    } catch {
      return false
    }
  }

  private async validateAnthropicKey(): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      })
      return response.ok
    } catch {
      return false
    }
  }

  private async validateOpenAIKey(): Promise<boolean> {
    try {
      const response = await fetch(
        'https://api.openai.com/v1/models',
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        }
      )
      return response.ok
    } catch {
      return false
    }
  }

  async askContextualQuestions(): Promise<Record<string, string>> {
    const prompt = `You are helping set up a Claude Code agent environment. Ask exactly 3-4 brief questions to understand their setup:
1. Team priority (one word: speed/safety/compliance/ux)
2. Tech stack (comma-separated: bun, drizzle, hono, etc)
3. Project name
4. Existing tooling they use

Format as JSON: { "question1": "...", "question2": "...", etc }
Be concise - each question is ONE line.`

    const questions = await this.call([
      { role: 'user', content: prompt },
    ])

    try {
      return JSON.parse(questions)
    } catch {
      return {
        teamPriority:
          'speed',
        stack: 'bun,drizzle,hono',
        projectName: 'MyApp',
        tooling: 'none',
      }
    }
  }

  async generateAgentContext(answers: Record<string, string>): Promise<string> {
    const prompt = `Based on these answers about their setup:
${Object.entries(answers)
  .map(([k, v]) => `${k}: ${v}`)
  .join('\n')}

Generate a focused system prompt for a Claude Code agent. The prompt should:
1. Know their team priority and emphasize it
2. Reference their stack (suggest relevant tools/patterns)
3. Be specific to their project
4. Be 150-200 words max

Return ONLY the agent prompt, no preamble.`

    return this.call([{ role: 'user', content: prompt }])
  }

  async decideWhichSkills(answers: Record<string, string>): Promise<string[]> {
    const stack = answers.stack || 'bun,drizzle,hono'
    const skills = stack
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => ['bun', 'drizzle', 'hono'].includes(s))

    return skills.length > 0 ? skills : ['bun']
  }

  private async call(messages: LLMMessage[]): Promise<string> {
    if (this.config.provider === 'anthropic') {
      return this.callAnthropic(messages)
    } else if (this.config.provider === 'openai') {
      return this.callOpenAI(messages)
    }
    throw new Error(`Unknown provider: ${this.config.provider}`)
  }

  private async callAnthropic(messages: LLMMessage[]): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 1024,
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = (await response.json()) as any
    return data.content[0]?.text || ''
  }

  private async callOpenAI(messages: LLMMessage[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = (await response.json()) as any
    return data.choices[0]?.message?.content || ''
  }
}
