import React, { useState } from 'react'
import { render, Box, Text } from 'ink'
import SelectInput from 'ink-select-input'
import TextInput from 'ink-text-input'
import { listProviders, getProvider } from '../llm/providers'
import { SetupConfig } from '../types'

interface LLMSetupProps {
  onComplete: (config: SetupConfig) => void
}

export function LLMSetup({ onComplete }: LLMSetupProps) {
  const [step, setStep] = useState<'provider' | 'model' | 'key'>('provider')
  const [config, setConfig] = useState<Partial<SetupConfig>>({})

  const handleProviderSelect = (value: string) => {
    setConfig((prev: Partial<SetupConfig>) => ({ ...prev, provider: value }))
    setStep('model')
  }

  const handleModelSelect = (value: string) => {
    setConfig((prev: Partial<SetupConfig>) => ({ ...prev, model: value }))
    setStep('key')
  }

  const handleKeyInput = (key: string) => {
    if (key.trim()) {
      const final: SetupConfig = {
        provider: config.provider!,
        model: config.model!,
        apiKey: key.trim(),
      }
      onComplete(final)
    }
  }

  if (step === 'provider') {
    return (
      <Box flexDirection="column">
        <Text bold>Select LLM Provider</Text>
        <SelectInput
          items={listProviders()}
          onSelect={(item) => handleProviderSelect(item.value)}
        />
      </Box>
    )
  }

  if (step === 'model') {
    const provider = getProvider(config.provider!)
    const models = provider?.models || []
    const items = models.map((m) => ({ label: m, value: m }))

    return (
      <Box flexDirection="column">
        <Text bold>Select Model</Text>
        <SelectInput
          items={items}
          onSelect={(item) => handleModelSelect(item.value)}
        />
      </Box>
    )
  }

  return (
    <Box flexDirection="column">
      <Text>
        API Key for <Text bold>{config.provider}</Text> (stored locally in .env, never committed)
      </Text>
      <TextInput
        placeholder="Paste your API key here..."
        value=""
        onChange={() => {}}
        onSubmit={handleKeyInput}
        mask="*"
      />
    </Box>
  )
}
