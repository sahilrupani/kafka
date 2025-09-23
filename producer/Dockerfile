FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production \
    PORT=3000 \
    KAFKA_CLIENT_ID=producer-app \
    KAFKA_BROKERS=localhost:9092 \
    KAFKA_TOPIC=demo-topic \
    PRODUCER_INTERVAL_MS=2000

EXPOSE 3000

CMD ["node", "src/index.js"]

