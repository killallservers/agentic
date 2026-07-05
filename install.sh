#!/bin/bash
set -e

REPO="${REPO:-killallservers/agentic}"
BRANCH="${BRANCH:-main}"
BASE_URL="https://raw.githubusercontent.com/$REPO/$BRANCH"

echo "Installing Claude Code configuration from $REPO/$BRANCH..."
echo ""

# Use GitHub API to fetch the tree recursively
get_tree() {
  local tree_url="https://api.github.com/repos/$REPO/git/trees/$BRANCH?recursive=1"
  curl -s "$tree_url" | grep -o '"path":"[^"]*","type":"[^"]*"' | \
    sed 's/"path":"\([^"]*\)","type":"\([^"]*\)"/\1 \2/'
}

# Download files, excluding LICENSE and install.sh
echo "Syncing configuration files..."
get_tree | while read -r path type; do
  # Skip excluded items
  if [[ "$path" == "LICENSE" ]] || [[ "$path" == "install.sh" ]] || \
     [[ "$path" == .git* ]] || [[ "$path" == node_modules* ]] || \
     [[ "$path" == dist/* ]] || [[ "$path" == build/* ]] || \
     [[ "$path" == .next/* ]] || [[ "$path" == *".tmp" ]] || \
     [[ "$path" == "bun.lockb" ]]; then
    continue
  fi

  if [[ "$type" == "tree" ]]; then
    # Create directory
    mkdir -p "$path" 2>/dev/null
  elif [[ "$type" == "blob" ]]; then
    # Download file
    mkdir -p "$(dirname "$path")"
    curl -s "$BASE_URL/$path" -o "$path" 2>/dev/null
    echo "  ✓ $path"
  fi
done

echo ""
echo "✓ Configuration installed from $REPO/$BRANCH"

# Upsert .gitignore with Claude Code runtime entries
echo "Upserting .gitignore..."
if [ ! -f .gitignore ]; then
  cat > .gitignore <<'EOF'
# Claude Code runtime/local files
.claude/scheduled_tasks.lock
.claude/settings.local.json
EOF
  echo "  ✓ Created .gitignore"
else
  # Ensure Claude Code entries exist
  if ! grep -q "Claude Code runtime" .gitignore 2>/dev/null; then
    cat >> .gitignore <<'EOF'

# Claude Code runtime/local files
.claude/scheduled_tasks.lock
.claude/settings.local.json
EOF
    echo "  ✓ Updated .gitignore"
  else
    echo "  ✓ .gitignore already has Claude Code entries"
  fi
fi

echo ""

# Copy TEMPLATE.md to README.md if README.md doesn't exist
if [ ! -f README.md ] && [ -f TEMPLATE.md ]; then
  cp TEMPLATE.md README.md
  echo "✓ Created README.md from TEMPLATE.md"
fi

echo ""
echo "Done! Claude Code is configured and ready."
