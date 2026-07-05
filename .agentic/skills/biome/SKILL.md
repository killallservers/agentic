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

## Troubleshooting

**"Cannot find name 'fs'"** → Missing `types: ["bun"]` in tsconfig.json

**"Cannot find name 'process'"** → Same issue, add the types field

**ESLint conflicts** → Biome is a drop-in replacement; remove ESLint config

**Slow builds** → Use `biome check` for faster validation, `biome format --write` only when needed
