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

# Map shared security env to Kafka UI expected vars if not explicitly set
if [ -n "${KAFKA_SECURITY_PROTOCOL:-}" ] && [ -z "${KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL:-}" ]; then
  export KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL="$KAFKA_SECURITY_PROTOCOL"
fi

if [ -n "${KAFKA_SASL_MECHANISM:-}" ] && [ -z "${KAFKA_CLUSTERS_0_PROPERTIES_SASL_MECHANISM:-}" ]; then
  export KAFKA_CLUSTERS_0_PROPERTIES_SASL_MECHANISM="$KAFKA_SASL_MECHANISM"
fi

# If username/password provided and JAAS not set, synthesize JAAS config for PLAIN/SCRAM
if [ -n "${KAFKA_SASL_USERNAME:-}" ] && [ -n "${KAFKA_SASL_PASSWORD:-}" ] && [ -z "${KAFKA_CLUSTERS_0_PROPERTIES_SASL_JAAS_CONFIG:-}" ]; then
  export KAFKA_CLUSTERS_0_PROPERTIES_SASL_JAAS_CONFIG="org.apache.kafka.common.security.plain.PlainLoginModule required username=\"${KAFKA_SASL_USERNAME}\" password=\"${KAFKA_SASL_PASSWORD}\";"
fi

# If KAFKA_SSL=true set SSL if protocol not set
if [ "${KAFKA_SSL:-}" = "true" ] && [ -z "${KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL:-}" ]; then
  export KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL="SSL"
fi

# Helpful defaults for SSL name verification
if [ -z "${KAFKA_CLUSTERS_0_PROPERTIES_SSL_ENDPOINT_IDENTIFICATION_ALGORITHM:-}" ]; then
  export KAFKA_CLUSTERS_0_PROPERTIES_SSL_ENDPOINT_IDENTIFICATION_ALGORITHM="https"
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
