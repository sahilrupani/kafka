import express from 'express';
import { Kafka, logLevel } from 'kafkajs';

const env = (k, d = undefined) => process.env[k] ?? d;

// Config
const port = parseInt(env('PORT', '3000'), 10);
const clientId = env('KAFKA_CLIENT_ID', 'producer-app');
const brokers = env('KAFKA_BROKERS', 'localhost:9092').split(',').map(s => s.trim()).filter(Boolean);
const topic = env('KAFKA_TOPIC', 'demo-topic');
const intervalMs = parseInt(env('PRODUCER_INTERVAL_MS', '2000'), 10);

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

// Enable SSL when explicitly set or when protocol includes SSL
const useSSL = (sslEnv && sslEnv.toLowerCase() === 'true') || (securityProtocol && securityProtocol.includes('SSL'));
if (useSSL) kafkaConfig.ssl = {};

// Enable SASL if username provided
if (saslUsername && saslPassword) {
  kafkaConfig.sasl = {
    mechanism: (saslMechanism || 'plain').toLowerCase(),
    username: saslUsername,
    password: saslPassword,
  };
}

const kafka = new Kafka(kafkaConfig);
const producer = kafka.producer();

const app = express();

let counter = 0;
let lastError = null;
let timer = null;

async function startProducer() {
  await producer.connect();
  timer = setInterval(async () => {
    const key = `k-${Date.now()}`;
    const value = JSON.stringify({ n: ++counter, ts: new Date().toISOString() });
    try {
      await producer.send({ topic, messages: [{ key, value }] });
    } catch (err) {
      lastError = err?.message || String(err);
      // eslint-disable-next-line no-console
      console.error('Producer error:', err);
    }
  }, intervalMs);
}

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/stats', (_req, res) => res.json({ produced: counter, topic }));
app.post('/produce', express.json(), async (req, res) => {
  try {
    const { key = `manual-${Date.now()}` } = req.query;
    const value = req.body ?? { ping: Date.now() };
    await producer.send({ topic, messages: [{ key, value: JSON.stringify(value) }] });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

const server = app.listen(port, async () => {
  // eslint-disable-next-line no-console
  console.log(`Producer listening on :${port}`);
  try {
    await startProducer();
    // eslint-disable-next-line no-console
    console.log('Producer connected to Kafka.');
  } catch (e) {
    lastError = e?.message || String(e);
    // eslint-disable-next-line no-console
    console.error('Failed to start producer:', e);
  }
});

async function shutdown() {
  if (timer) clearInterval(timer);
  try { await producer.disconnect(); } catch {}
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

