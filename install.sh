#!/bin/bash
set -e

ORIGINAL_DIR=$(pwd)

echo ""
echo "🚀 Claude Code Agent Setup"
echo "📍 Install location: $ORIGINAL_DIR"
echo ""

read -p "Is this the correct project directory? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  read -p "Enter project path: " PROJECT_PATH
  if [[ ! -d "$PROJECT_PATH" ]]; then
    echo "❌ Directory does not exist: $PROJECT_PATH"
    exit 1
  fi
  ORIGINAL_DIR="$PROJECT_PATH"
  echo "✅ Using: $ORIGINAL_DIR"
  echo ""
fi

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo "📥 Cloning agentic..."
git clone https://github.com/killallservers/agentic "$TMPDIR"

cd "$TMPDIR"

echo "📦 Installing dependencies..."
bun install

echo "🔨 Building CLI..."
bun run build

echo ""
cd "$ORIGINAL_DIR"
node "$TMPDIR/dist/index.js" setup
