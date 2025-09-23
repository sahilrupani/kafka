# Kafka UI on Railway (Template)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/OWNER/REPO)

Self-hosted Kafka UI (Provectus Kafka UI) packaged for a one-click deploy on Railway.
It provides topic browsing, consumer groups, partitions, message inspection/produce, and more.

## Quick Start

- Local (Docker Compose):
  - Copy `.env.example` to `.env` and set `KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS`.
  - Optionally set `KAFKA_BROKERS` and `KAFKA_TOPIC` for the sample producer/consumer.
  - Run: `docker compose up -d`
  - Open UI: http://localhost:8080
  - Producer health: http://localhost:3001/health | stats: http://localhost:3001/stats
  - Consumer health: http://localhost:3002/health | stats: http://localhost:3002/stats

- Deploy on Railway:
  - Create a new Railway project from this repo (or use a Deploy button).
  - Set environment variables for your Kafka cluster (see Config below).
  - Ensure the service listens on `SERVER_PORT` (default 8080). If Railway provides a `PORT` env var, set `SERVER_PORT` to the same value.

> Tip: You can enable `DYNAMIC_CONFIG_ENABLED=true` to add clusters via the UI without redeploying.

## Configuration

This template uses the official Docker image `provectuslabs/kafka-ui` and includes sample Producer/Consumer Node.js services.
Configure clusters via environment variables (first cluster is index 0), and shared Kafka client settings:

- KAFKA_UI_CONTAINER_NAME: Optional container name for local compose (default `kafka-ui-app`).
- KAFKA_CLUSTERS_0_NAME: Name for the cluster (e.g., `cluster-1`).
- KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: Kafka bootstrap servers (e.g., `broker:9092`).
- KAFKA_CLUSTERS_0_ZOOKEEPER: Optional; only for older setups needing Zookeeper.
- DYNAMIC_CONFIG_ENABLED: `true` to allow adding clusters in the UI.
- KAFKA_CLUSTERS_0_READONLY: `true` to disable produce/delete ops.
- SERVER_PORT: Port to listen on (default `8080`). On Railway, set this to match `PORT` if required by your environment.

Shared Producer/Consumer settings:
- KAFKA_BROKERS: Comma-separated brokers for sample services (e.g., `localhost:9092`).
- KAFKA_TOPIC: Topic to produce/consume (e.g., `demo-topic`).
- KAFKA_SSL: `true` to enable TLS.
- KAFKA_SECURITY_PROTOCOL / KAFKA_SASL_*: Use when your cluster requires SASL/SSL (see below).

Producer-specific:
- PRODUCER_KAFKA_CLIENT_ID: Client ID (default `producer-app`).
- PRODUCER_INTERVAL_MS: Auto-produce interval in ms (default `2000`).

Consumer-specific:
- CONSUMER_KAFKA_CLIENT_ID: Client ID (default `consumer-app`).
- KAFKA_GROUP_ID: Consumer group (default `demo-group`).

### SASL/SSL (optional)
If your Kafka requires auth, set these as needed:

- KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL: e.g., `SASL_SSL`, `SASL_PLAINTEXT`, `SSL`, or `PLAINTEXT`.
- KAFKA_CLUSTERS_0_PROPERTIES_SASL_MECHANISM: e.g., `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`.
- KAFKA_CLUSTERS_0_PROPERTIES_SASL_JAAS_CONFIG:
  `org.apache.kafka.common.security.plain.PlainLoginModule required username="user" password="pass";`

Additional SSL-related properties can be provided using the same pattern, e.g.:
`KAFKA_CLUSTERS_0_PROPERTIES_SSL_TRUSTSTORE_LOCATION`, `KAFKA_CLUSTERS_0_PROPERTIES_SSL_TRUSTSTORE_PASSWORD`, etc.

For the sample Producer/Consumer, set:
- KAFKA_SSL=true (or rely on `KAFKA_SECURITY_PROTOCOL` containing `SSL`).
- KAFKA_SASL_MECHANISM (e.g., `PLAIN`, `SCRAM-SHA-256`).
- KAFKA_SASL_USERNAME / KAFKA_SASL_PASSWORD.


## Railway Setup
- Create a Railway project from this repo.
- Create three services from this repo:
  - kafka-ui (Service Path: `/`, Dockerfile at root)
  - producer (Service Path: `/producer`, Dockerfile in that folder)
  - consumer (Service Path: `/consumer`, Dockerfile in that folder)
- Set environment variables on each service:
  - Shared: `KAFKA_BROKERS`, `KAFKA_TOPIC`, and any `KAFKA_SSL` / `KAFKA_SASL_*` if needed.
  - UI: `KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS` (match `KAFKA_BROKERS`), `KAFKA_CLUSTERS_0_NAME`.
  - Producer: optional `PRODUCER_INTERVAL_MS`, `PRODUCER_KAFKA_CLIENT_ID`.
  - Consumer: `KAFKA_GROUP_ID`, optional `CONSUMER_KAFKA_CLIENT_ID`.
- Ports:
  - kafka-ui listens on `8080` (use `SERVER_PORT=8080` if needed).
  - producer/consumer expose an HTTP health port `3000` (Railway typically assigns an external URL; you can set `PORT=3000`).

## Deploy Button
The Deploy button above uses a placeholder URL. After pushing to GitHub, replace `https://github.com/OWNER/REPO` with your repo URL so Railway can import your template directly.

## Notes
- This template does not run a Kafka broker. Point it at your existing Kafka cluster(s).
- For advanced configuration (RBAC, schema registry, ksql, multiple clusters), see the Provectus Kafka UI documentation.
