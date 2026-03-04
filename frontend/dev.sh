#!/usr/bin/env bash
# Run with full path if ./dev.sh fails: /Users/ashutosh/Desktop/outdoor/frontend/dev.sh
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
exec "$DIR/node_modules/.bin/vite"
