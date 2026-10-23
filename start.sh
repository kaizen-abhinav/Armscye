#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$DIR/node_bin/bin:$PATH"

echo "=== Starting MirrorFit AI Services ==="

# 1. Start Python VTON Inference Service (port 8001)
if ! curl -s http://127.0.0.1:8001/health > /dev/null; then
  echo "Starting FASHN VTON v1.5 Inference Service on port 8001..."
  "$DIR/.venv/bin/uvicorn" main:app --app-dir "$DIR/services/vton-service" --host 127.0.0.1 --port 8001 &
  VTON_PID=$!
  echo "Waiting for VTON service to load models..."
  until curl -s http://127.0.0.1:8001/health | grep -q "healthy"; do
    sleep 2
  done
  echo "✓ VTON Service is ready!"
else
  echo "✓ VTON Service is already running on port 8001."
fi

# 2. Start Application Backend (port 8000)
if ! curl -s http://127.0.0.1:8000/api/health > /dev/null; then
  echo "Starting Express Backend on port 8000..."
  cd "$DIR/backend"
  node server.js &
  BACKEND_PID=$!
  sleep 2
  echo "✓ Express Backend is ready!"
else
  echo "✓ Express Backend is already running on port 8000."
fi

# 3. Start Frontend (port 5173)
echo "Starting Vite Frontend on port 5173..."
cd "$DIR/frontend"
npm run dev
