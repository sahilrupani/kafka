#!/usr/bin/env bash
set -euo pipefail

KAFKA_UI_JAR_PATH="/app/kafka-ui.jar"
: "${SERVER_PORT:=8080}"
: "${PRODUCER_PORT:=3001}"
: "${CONSUMER_PORT:=3002}"

echo "[all-in-one] Starting services: UI:${SERVER_PORT}, producer:${PRODUCER_PORT}, consumer:${CONSUMER_PORT}"

# Fetch Kafka UI JAR if not present
if [ ! -f "$KAFKA_UI_JAR_PATH" ]; then
  if [ -n "${KAFKA_UI_JAR_URL:-}" ]; then
    echo "[all-in-one] Downloading Kafka UI JAR from $KAFKA_UI_JAR_URL ..."
    curl -fsSL "$KAFKA_UI_JAR_URL" -o "$KAFKA_UI_JAR_PATH"
  else
    echo "[all-in-one] ERROR: Kafka UI JAR not found and KAFKA_UI_JAR_URL not set."
    echo "Set KAFKA_UI_JAR_URL to a valid release JAR (e.g., from provectus/kafka-ui releases)."
    exit 1
  fi
fi

# Start producer
PORT="$PRODUCER_PORT" node /app/producer/src/index.js &
PID_PRODUCER=$!
echo "[all-in-one] Producer PID: $PID_PRODUCER"

# Start consumer
PORT="$CONSUMER_PORT" node /app/consumer/src/index.js &
PID_CONSUMER=$!
echo "[all-in-one] Consumer PID: $PID_CONSUMER"

# Start Kafka UI in foreground
echo "[all-in-one] Launching Kafka UI ..."
exec java -jar "$KAFKA_UI_JAR_PATH"

