import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { resolve, relative, dirname } from 'path'
import { execSync } from 'child_process'
import { Config } from './config'

export async function installScaffolding(config: Config): Promise<void> {
  const sourceDir = resolve('src/init')
  const targetDir = resolve('.agentic')

  const dirsToCreate = [
    'agents',
    'skills',
    'workflows',
    'rules',
    'rules/patterns',
    'memory',
  ]

  // Create base directories
  dirsToCreate.forEach((dir) => {
    mkdirSync(resolve(targetDir, dir), { recursive: true })
  })

  // Copy files from src/init to .agentic, maintaining structure
  copyDirRecursive(sourceDir, targetDir)

  console.log('✅ Scaffolding installed to .agentic/')
}

function copyDirRecursive(source: string, target: string): void {
  const entries = readdirSync(source, { withFileTypes: true })

  for (const entry of entries) {
    // Skip hooks directory (handled separately by symlink hook)
    if (entry.name === 'hooks') {
      continue
    }

    const sourcePath = resolve(source, entry.name)
    const targetPath = resolve(target, entry.name)

    if (entry.isDirectory()) {
      mkdirSync(targetPath, { recursive: true })
      copyDirRecursive(sourcePath, targetPath)
    } else {
      // Skip this file if target already exists (don't overwrite user edits)
      let shouldCopy = true
      try {
        statSync(targetPath)
        // File exists; skip to avoid overwriting
        shouldCopy = false
      } catch {
        // File doesn't exist; copy it
      }

      if (shouldCopy) {
        copyFileSync(sourcePath, targetPath)
      }
    }
  }
}

export async function runSymlinkHook(): Promise<void> {
  try {
    const hookPath = resolve('.agentic/hooks/symlink-to-claude.sh')
    execSync(`bash "${hookPath}"`, { stdio: 'inherit' })
    console.log('✅ Symlink hook completed')
  } catch (error) {
    console.error('⚠️  Symlink hook failed. You can run it manually later with:')
    console.error('   bash .agentic/hooks/symlink-to-claude.sh')
    throw error
  }
}
