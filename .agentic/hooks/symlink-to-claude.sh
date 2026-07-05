#!/bin/bash
# Symlink files from .agentic/ to .claude/ maintaining directory structure

AGENTIC_DIR=".agentic"
CLAUDE_DIR=".claude"

# Clean up stale symlinks/files whose sources no longer exist
find "$CLAUDE_DIR" -type f -o -type l | while read -r target; do
  if [ -L "$target" ]; then
    # For symlinks, check if target exists
    [ ! -e "$target" ] && rm "$target"
  elif [ -f "$target" ]; then
    # For regular files, skip settings.json files (user config)
    if [[ ! "$target" =~ settings.*\.json$ ]]; then
      source="${target#$CLAUDE_DIR/}"
      source="$AGENTIC_DIR/$source"
      [ ! -f "$source" ] && rm "$target"
    fi
  fi
done

# Clean up empty directories (except .claude root and direct subdirs)
find "$CLAUDE_DIR" -mindepth 2 -type d -empty -delete

# Create symlinks for all existing files in .agentic/ (exclude hooks)
find "$AGENTIC_DIR" -type f ! -path "*/.git*" ! -path "*/hooks/*" | while read -r file; do
  # Calculate target path maintaining directory structure
  relative_path="${file#$AGENTIC_DIR/}"
  target_dir="$CLAUDE_DIR/$(dirname "$relative_path")"
  target_file="$target_dir/$(basename "$file")"

  # Create target directory if it doesn't exist
  mkdir -p "$target_dir"

  # Remove existing symlink or file
  if [ -L "$target_file" ] || [ -f "$target_file" ]; then
    rm "$target_file"
  fi

  # Calculate relative path from target to source
  # Get depth of target directory (count slashes in relative_path minus 1 for basename)
  depth=$(echo "$relative_path" | tr -cd '/' | wc -c)

  # Build relative path up to .agentic level
  rel_prefix=""
  for ((i=0; i<=depth; i++)); do
    rel_prefix="../$rel_prefix"
  done

  # Create symlink with correct relative path
  ln -s "${rel_prefix}.agentic/${relative_path}" "$target_file"
done

echo "Symlinks created successfully"
