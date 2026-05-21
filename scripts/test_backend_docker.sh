#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../backend"

CONTAINER_NAME="sweetroots-api-test"
PORT="8080"

cleanup() {
    echo
    echo "Stopping container..."
    docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
    docker rm "${CONTAINER_NAME}" >/dev/null 2>&1 || true
}

trap cleanup EXIT

echo "Cleaning previous containers..."
docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
docker rm "${CONTAINER_NAME}" >/dev/null 2>&1 || true

echo "Checking port ${PORT}..."
if lsof -Pi :"${PORT}" -sTCP:LISTEN -t >/dev/null ; then
    echo "Port ${PORT} is already in use."
    exit 1
fi

echo "Building Docker image..."
docker build -t sweetroots-api .

echo "Starting container..."
docker run -d \
    --name "${CONTAINER_NAME}" \
    --env-file .env \
    -e PORT="${PORT}" \
    -e SERVE_FRONTEND=false \
    -p "${PORT}:${PORT}" \
    sweetroots-api

echo "Waiting for API health..."

for attempt in {1..15}; do
    if curl -fs "http://127.0.0.1:${PORT}/health"; then
        echo
        break
    fi

    echo "Health check attempt ${attempt}/15 failed. Retrying..."
    sleep 2
done

if ! curl -fs "http://127.0.0.1:${PORT}/health" >/dev/null; then
    echo
    echo "Health check failed. Container logs:"
    docker logs "${CONTAINER_NAME}" || true
    exit 1
fi

echo
echo "Testing /docs..."
curl -f -I "http://127.0.0.1:${PORT}/docs"

echo
echo "Backend Docker test passed."
