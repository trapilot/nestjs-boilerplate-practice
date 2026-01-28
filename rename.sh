#!/bin/bash

# Usage:
# ./rename.sh <find_pattern> <replace_pattern> [path]

FIND="$1"
REPLACE="$2"
PATH_TARGET="${3:-src/modules}"

if [ -z "$FIND" ] || [ -z "$REPLACE" ]; then
  echo "Usage: $0 <find_pattern> <replace_pattern> [path]"
  exit 1
fi

echo "Find:    $FIND"
echo "Replace: $REPLACE"
echo "Path:    $PATH_TARGET"
echo

echo "=== DRY RUN (preview) ==="

# Preview folder rename
find "$PATH_TARGET" -depth -type d -name "*$FIND*" | while read -r DIR; do
  NEW="${DIR//$FIND/$REPLACE}"
  echo "[DIR ] $DIR -> $NEW"
done

# Preview file rename
find "$PATH_TARGET" -depth -type f -name "*$FIND*" | while read -r FILE; do
  NEW="${FILE//$FIND/$REPLACE}"
  echo "[FILE] $FILE -> $NEW"
done

# Preview content replace
echo
echo "=== CONTENT PREVIEW ==="
grep -R --color=always "$FIND" "$PATH_TARGET" || echo "No content matches"

echo
read -p "Proceed with rename & content replace? (y/N): " CONFIRM

if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "🚀 Replacing content (case-sensitive)..."
  if sed --version >/dev/null 2>&1; then
    # GNU sed (Linux)
    find "$PATH_TARGET" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.prisma" \) \
      -exec sed -i "s/$FIND/$REPLACE/g" {} +
  else
    # BSD sed (macOS)
    find "$PATH_TARGET" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.prisma" \) \
      -exec sed -i "" "s/$FIND/$REPLACE/g" {} +
  fi

  echo "🚀 Renaming folders..."
  find "$PATH_TARGET" -depth -type d -name "*$FIND*" | while read -r DIR; do
    NEW="${DIR//$FIND/$REPLACE}"
    mv "$DIR" "$NEW"
  done

  echo "🚀 Renaming files..."
  find "$PATH_TARGET" -depth -type f -name "*$FIND*" | while read -r FILE; do
    NEW="${FILE//$FIND/$REPLACE}"
    mkdir -p "$(dirname "$NEW")"
    mv "$FILE" "$NEW"
  done

  echo "✅ Done"
else
  echo "❌ Cancelled"
fi
