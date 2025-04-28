#!/bin/bash
set -e

# Function to clean up background services on exit
function cleanup() {
  echo "Stopping all background services..."
  kill $ml_pid $server_pid
  exit 0
}

# Trap SIGINT and SIGTERM signals to call cleanup
trap cleanup SIGINT SIGTERM

# Start ML Service
echo "Starting ML Service..."
cd ml_service || { echo "Failed to cd into ml_service"; exit 1; }
./run.sh &
# ml_pid=$!

# Start Backend Server
echo "Starting Server..."
cd ../server || { echo "Failed to cd into server"; exit 1; }
npm start &
server_pid=$!

# Wait a few seconds to ensure services are up
echo "Waiting for services to start..."
sleep 5

# Start Frontend Client
echo "Starting Client..."
cd ../client || { echo "Failed to cd into client"; exit 1; }
npm start

# After frontend exits, clean up background services
cleanup