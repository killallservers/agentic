# Biome Skill

Fast formatter and linter for JavaScript, TypeScript, JSX, and more.

## Setup for Bun CLI Projects

### tsconfig.json

For Bun projects (not Node), configure TypeScript to use Bun's types:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "types": ["bun", "react"],
    "strict": true,
    "skipLibCheck": true,
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

Key points:
- `types: ["bun", "react"]` — Use Bun's native types (fs, path, process) instead of Node
- `moduleResolution: "bundler"` — Bun's resolution strategy
- No `@types/node` needed for Bun

### biome.json

Basic Biome config for TypeScript/React:

```json
{
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noImplicitAnyLet": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentSize": 2,
    "lineWidth": 100
  }
}
```

### package.json Scripts

```json
{
  "scripts": {
    "lint": "biome lint --apply src/",
    "format": "biome format --write src/",
    "check": "biome check src/"
  }
}
```

## Common Patterns

### Strict Mode

Enable strict type checking:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### React JSX

For React with Biome:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

### Exclude Patterns

Keep node_modules and build artifacts out of checks:

```json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "build", ".claude"]
}
```

## Edge Cases & Gotchas

### Biome + Prettier Conflicts

**Problem:** Both tools try to format, resulting in conflicts

**Symptom:**
```bash
biome check  # Fails because Prettier already formatted differently
```

**Solution:**
- Use **only Biome** (preferred)
- Or: disable Biome formatting, use Prettier only

```json
{
  "formatter": {
    "enabled": false  // Let Prettier handle formatting
  },
  "linter": {
    "enabled": true   // Biome handles linting
  }
}
```

### Biome + ESLint Compatibility

**Problem:** ESLint and Biome have conflicting rules

**Symptom:**
```bash
eslint . --fix  # Formats one way
biome format . --write  # Reformats differently
```

**Solution:**
- Remove ESLint if using Biome (don't mix)
- Biome replaces ESLint + Prettier

```bash
# Pick one:
biome check && biome format --write  # Biome only
# OR
eslint . --fix && prettier --write  # ESLint + Prettier
# NOT both
```

### Format-on-Save + Git Hooks Conflict

**Problem:** IDE formats on save, pre-commit hook formats again

**Symptom:**
```
1. Save file in VSCode (biome formats)
2. git commit
3. Pre-commit hook runs biome format
4. Changes happen after you saved, confusing
```

**Solution:**
```json
// .vscode/settings.json
{
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": false  // Let pre-commit handle it
  }
}
```

```bash
#!/bin/bash
# .git/hooks/pre-commit
biome check --apply-unsafe
git add -A
```

### VSCode Extension Version Mismatch

**Problem:** VSCode extension version doesn't match project's Biome version

**Symptom:**
```
VSCode: Biome 1.8.2
Project: Biome 1.7.3
# Linting rules don't match
```

**Solution:**
```bash
# Lock extension version
# In .vscode/extensions.json or settings.json
{
  "recommendations": [
    "biomejs.biome@1.8.2"
  ]
}
```

## Anti-Patterns

### ❌ Don't: Mix Biome and ESLint

```json
{
  "extends": ["eslint:recommended"],
  "plugins": ["eslint-plugin-biome"]  // Redundant!
}
```

```json
{
  "linter": {
    "enabled": true
  }
  // Use Biome alone
}
```

### ❌ Don't: Run format and lint separately

```bash
# Bad: two commands, easy to forget one
biome check
biome format --write
git add .
```

```bash
# Good: single command
biome check --apply-unsafe  # Check + fix in one
git add .
```

### ❌ Don't: Ignore Biome warnings in CI

```bash
# Bad: CI allows failures
biome check || true
git push
```

```bash
# Good: CI blocks on failures
biome check
# Exit code 1 if issues, blocks push
```

## Troubleshooting

**"Cannot find name 'fs'"** → Missing `types: ["bun"]` in tsconfig.json

**"Cannot find name 'process'"** → Same issue, add the types field

**ESLint conflicts** → Biome is a drop-in replacement; remove ESLint config

**Slow builds** → Use `biome check` for faster validation, `biome format --write` only when needed
