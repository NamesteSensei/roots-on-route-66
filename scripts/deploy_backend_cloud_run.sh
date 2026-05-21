#!/usr/bin/env bash
set -e

PROJECT_ID="${PROJECT_ID:-}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-sweetroots-api}"

if [ -z "${PROJECT_ID}" ]; then
    echo "PROJECT_ID is required."
    echo "Example:"
    echo "PROJECT_ID=my-google-cloud-project ./scripts/deploy_backend_cloud_run.sh"
    exit 1
fi

echo "Using project: ${PROJECT_ID}"
echo "Using region: ${REGION}"
echo "Using service: ${SERVICE_NAME}"

gcloud config set project "${PROJECT_ID}"

echo "Building and deploying backend to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
    --source backend \
    --region "${REGION}" \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --set-env-vars SERVE_FRONTEND=false

echo "Deployment complete."
