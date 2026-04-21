#!/usr/bin/env bash
set -euo pipefail

cd /home/emppu/projects/hermes-web

export PORT=3001
export NODE_ENV=production

# Load .env.local
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

exec npm run start
