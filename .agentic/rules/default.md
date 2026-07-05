# Product Security Rules

## Read Access
- ✅ All `.agentic/` files
- ✅ All `src/` directories
- ✅ README.md
- ✅ Package manifests (package.json, go.mod, Cargo.toml)
- ❌ .env files
- ❌ secrets/, keys/, credentials/

## Execute Access
- ✅ Type checking (tsc, go vet, cargo check)
- ✅ Testing (npm test, go test, cargo test)
- ✅ Building (npm run build, go build, cargo build)
- ✅ Formatting (prettier, gofmt, rustfmt)
- ❌ Deployments (no vercel deploy, kubectl apply, etc.)
- ❌ Database operations in production
- ❌ Deleting files outside of build artifacts

## Package Management
- ✅ Add packages using `@latest` version specifier
- ❌ Never guess or hardcode versions
- When adding packages, always use: `bun add package@latest` or `npm install package@latest`
