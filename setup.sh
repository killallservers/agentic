#!/bin/bash
set -e

ORIGINAL_DIR=$(pwd)
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
