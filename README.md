# Kafka UI on Railway (Template)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/OWNER/REPO)

Self-hosted Kafka UI (Provectus Kafka UI) packaged for a one-click deploy on Railway.
It provides topic browsing, consumer groups, partitions, message inspection/produce, and more.

## Quick Start

- Local (Docker Compose):
  - Copy `.env.example` to `.env` and set `KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS`.
  - Run: `docker compose up -d`
  - Open: http://localhost:8080

- Deploy on Railway:
  - Push this repo to your GitHub account.
  - Create a new Railway project from this repo (or use a Deploy button).
  - Set environment variables for your Kafka cluster (see Config below).
  - Ensure the service listens on `SERVER_PORT` (default 8080). If Railway provides a `PORT` env var, set `SERVER_PORT` to the same value.

> Tip: You can enable `DYNAMIC_CONFIG_ENABLED=true` to add clusters via the UI without redeploying.

## Configuration

This template uses the official Docker image `provectuslabs/kafka-ui`.
Configure clusters via environment variables (first cluster is index 0):

- KAFKA_UI_CONTAINER_NAME: Optional container name for local compose (default `kafka-ui-app`).
- KAFKA_CLUSTERS_0_NAME: Name for the cluster (e.g., `cluster-1`).
- KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: Kafka bootstrap servers (e.g., `broker:9092`).
- KAFKA_CLUSTERS_0_ZOOKEEPER: Optional; only for older setups needing Zookeeper.
- DYNAMIC_CONFIG_ENABLED: `true` to allow adding clusters in the UI.
- KAFKA_CLUSTERS_0_READONLY: `true` to disable produce/delete ops.
- SERVER_PORT: Port to listen on (default `8080`). On Railway, set this to match `PORT` if required by your environment.

### SASL/SSL (optional)
If your Kafka requires auth, set these as needed:

- KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL: e.g., `SASL_SSL`, `SASL_PLAINTEXT`, `SSL`, or `PLAINTEXT`.
- KAFKA_CLUSTERS_0_PROPERTIES_SASL_MECHANISM: e.g., `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`.
- KAFKA_CLUSTERS_0_PROPERTIES_SASL_JAAS_CONFIG:
  `org.apache.kafka.common.security.plain.PlainLoginModule required username="user" password="pass";`

Additional SSL-related properties can be provided using the same pattern, e.g.:
`KAFKA_CLUSTERS_0_PROPERTIES_SSL_TRUSTSTORE_LOCATION`, `KAFKA_CLUSTERS_0_PROPERTIES_SSL_TRUSTSTORE_PASSWORD`, etc.

## Files

- Dockerfile: Uses `provectuslabs/kafka-ui:latest` and exposes 8080.
- docker-compose.yml: Local dev convenience to run the UI.
- .env.example: Copy to `.env` and fill in values.
- .dockerignore / .gitignore: Build and repo hygiene.

## Deploy Button
The Deploy button above uses a placeholder URL. After pushing to GitHub, replace `https://github.com/OWNER/REPO` with your repo URL so Railway can import your template directly.

## Notes
- This template does not run a Kafka broker. Point it at your existing Kafka cluster(s).
- For advanced configuration (RBAC, schema registry, ksql, multiple clusters), see the Provectus Kafka UI documentation.
