# Simple Dockerfile to run the open-source Provectus Kafka UI on Railway
# Docs: https://github.com/provectus/kafka-ui

FROM provectuslabs/kafka-ui:latest

# Default port; can be overridden by setting env var SERVER_PORT
ENV SERVER_PORT=8080

EXPOSE 8080

# Image has a default entrypoint/cmd; no override needed
