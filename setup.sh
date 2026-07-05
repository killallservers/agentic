#!/bin/bash
set -e

TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo "📥 Cloning agentic..."
git clone https://github.com/killallservers/agentic "$TMPDIR"

cd "$TMPDIR"

echo "📦 Installing dependencies..."
bun install

echo ""
bun run dev setup
