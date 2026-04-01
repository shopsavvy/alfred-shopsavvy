#!/bin/bash
set -e

echo "ShopSavvy Alfred Workflow Tests"
echo "================================"

if [ "$1" = "--integration" ]; then
  if [ -z "$SHOPSAVVY_API_KEY" ]; then
    echo "Set SHOPSAVVY_API_KEY env var to run integration tests"
    echo "  Get a key at https://shopsavvy.com/data"
    exit 1
  fi
  echo "Running integration tests (live API)..."
  echo ""

  echo "Testing search..."
  RESULT=$(bun run src/search.ts "airpods pro")
  if echo "$RESULT" | grep -q '"items"'; then
    echo "  Search output valid"
  else
    echo "  Search output invalid"
    exit 1
  fi

  echo "Testing price..."
  RESULT=$(bun run src/price.ts "B0BSHF7WHW")
  if echo "$RESULT" | grep -q '"items"'; then
    echo "  Price output valid"
  else
    echo "  Price output invalid"
    exit 1
  fi

  echo "Testing deals..."
  RESULT=$(bun run src/deals.ts)
  if echo "$RESULT" | grep -q '"items"'; then
    echo "  Deals output valid"
  else
    echo "  Deals output invalid"
    exit 1
  fi

  echo ""
  echo "All integration tests passed"
else
  echo "Running structural checks..."
  echo ""

  echo "Checking required files..."
  REQUIRED="src/search.ts src/price.ts src/deals.ts package.json README.md"
  MISSING=0
  for f in $REQUIRED; do
    if [ ! -f "$f" ]; then
      echo "  Missing: $f"
      MISSING=$((MISSING + 1))
    fi
  done
  if [ $MISSING -eq 0 ]; then
    echo "  All required files present ($(echo $REQUIRED | wc -w | tr -d ' ') files)"
  else
    echo "  $MISSING required files missing"
    exit 1
  fi

  echo "Checking TypeScript syntax..."
  if command -v bun &> /dev/null; then
    ERRORS=0
    for f in src/*.ts; do
      if ! bun build --no-bundle "$f" --outfile /tmp/alfred-shopsavvy-check.js > /dev/null 2>&1; then
        echo "  Syntax error: $f"
        ERRORS=$((ERRORS + 1))
      fi
    done
    if [ $ERRORS -eq 0 ]; then
      echo "  All TypeScript files pass syntax check"
    else
      echo "  $ERRORS files have syntax errors"
      exit 1
    fi
    rm -f /tmp/alfred-shopsavvy-check.js
  else
    echo "  bun not installed -- skipping syntax check"
  fi

  echo "Checking Alfred JSON output format..."
  if command -v bun &> /dev/null; then
    # Test that scripts output valid Alfred JSON when no API key is set
    for script in src/search.ts src/price.ts src/deals.ts; do
      RESULT=$(SHOPSAVVY_API_KEY="" bun run "$script" "test" 2>/dev/null || true)
      if echo "$RESULT" | grep -q '"items"'; then
        echo "  $script: valid Alfred JSON"
      else
        echo "  $script: invalid output"
        exit 1
      fi
    done
  fi

  echo ""
  echo "All unit checks passed"
fi
