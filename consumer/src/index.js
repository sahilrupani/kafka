import express from 'express';
import { Kafka, logLevel } from 'kafkajs';

const env = (k, d = undefined) => process.env[k] ?? d;

// Config
const port = parseInt(env('PORT', '3000'), 10);
const clientId = env('KAFKA_CLIENT_ID', 'consumer-app');
const groupId = env('KAFKA_GROUP_ID', 'demo-group');
const brokers = env('KAFKA_BROKERS', 'localhost:9092').split(',').map(s => s.trim()).filter(Boolean);
const topic = env('KAFKA_TOPIC', 'demo-topic');

// Optional security
const securityProtocol = env('KAFKA_SECURITY_PROTOCOL'); // e.g., SASL_SSL
const saslMechanism = env('KAFKA_SASL_MECHANISM'); // e.g., PLAIN, SCRAM-SHA-256
const saslUsername = env('KAFKA_SASL_USERNAME');
const saslPassword = env('KAFKA_SASL_PASSWORD');
const sslEnv = env('KAFKA_SSL'); // 'true' to enable

const kafkaConfig = {
  clientId,
  brokers,
  logLevel: logLevel.NOTHING,
};

const useSSL = (sslEnv && sslEnv.toLowerCase() === 'true') || (securityProtocol && securityProtocol.includes('SSL'));
if (useSSL) kafkaConfig.ssl = {};

if (saslUsername && saslPassword) {
  kafkaConfig.sasl = {
    mechanism: (saslMechanism || 'plain').toLowerCase(),
    username: saslUsername,
    password: saslPassword,
  };
}

const kafka = new Kafka(kafkaConfig);
const consumer = kafka.consumer({ groupId });

const app = express();

let consumed = 0;
let lastMessage = null;

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message, partition }) => {
      consumed++;
      lastMessage = {
        partition,
        offset: message.offset,
        key: message.key?.toString(),
        value: (() => { try { return JSON.parse(message.value?.toString() || 'null'); } catch { return message.value?.toString(); } })(),
        ts: new Date().toISOString(),
      };
    },
  });
}

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/stats', (_req, res) => res.json({ consumed, topic, lastMessage }));

const server = app.listen(port, async () => {
  // eslint-disable-next-line no-console
  console.log(`Consumer listening on :${port}`);
  try {
    await startConsumer();
    // eslint-disable-next-line no-console
    console.log('Consumer connected to Kafka.');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to start consumer:', e);
  }
});

async function shutdown() {
  try { await consumer.disconnect(); } catch {}
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

