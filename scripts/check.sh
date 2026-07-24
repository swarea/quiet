#!/usr/bin/env sh
# Thin wrapper so the gate has one entry point on any OS. Real logic is in
# check.mjs (Node), so Windows without Git Bash/WSL can run `npm run check` too.
# See CONTRIBUTING.md; the "--all" flag is reserved for the heavier suite.
set -e
DIR=$(dirname "$0")
node "$DIR/check.mjs" "$@"
