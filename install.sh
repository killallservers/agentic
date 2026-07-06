#!/bin/sh
set -e

INSTALL_DIR="${AGENTIC_INSTALL_DIR:-.}"
RELEASE_VERSION="latest"
OS=$(uname -s)
ARCH=$(uname -m)

# Map OS and ARCH to download filename
case "$OS" in
  Linux)
    case "$ARCH" in
      x86_64) PLATFORM="linux-x64" ;;
      aarch64) PLATFORM="linux-arm64" ;;
      *) echo "❌ Unsupported architecture: $ARCH"; exit 1 ;;
    esac
    ;;
  Darwin)
    case "$ARCH" in
      x86_64) PLATFORM="macos-x64" ;;
      arm64) PLATFORM="macos-arm64" ;;
      *) echo "❌ Unsupported architecture: $ARCH"; exit 1 ;;
    esac
    ;;
  *)
    echo "❌ Unsupported OS: $OS"
    exit 1
    ;;
esac

DOWNLOAD_URL="https://github.com/killallservers/agentic/releases/download/$RELEASE_VERSION/agentic-$PLATFORM"
BINARY_PATH="$INSTALL_DIR/agentic"

echo "📥 Downloading agentic CLI..."
curl -fsSL "$DOWNLOAD_URL" -o "$BINARY_PATH"
chmod +x "$BINARY_PATH"

echo ""
"$BINARY_PATH" setup
