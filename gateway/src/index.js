require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());
// No express.json() here: the proxy must forward the raw request body.

app.get('/health', (req, res) => res.json({ service: 'gateway', status: 'ok' }));

// The mobile app only ever talks to the gateway, never to a service directly.
// pathFilter keeps the full path (e.g. /api/auth/login) when forwarding.
const proxy = (path, target) =>
  createProxyMiddleware({ target, pathFilter: path, changeOrigin: true });

app.use(proxy('/api/auth', process.env.AUTH_SERVICE_URL));
app.use(proxy('/api/requests', process.env.REQUEST_SERVICE_URL));
app.use(proxy('/api/donors', process.env.DONOR_SERVICE_URL));
app.use(proxy('/api/verification', process.env.VERIFICATION_SERVICE_URL));
app.use(proxy('/api/notifications', process.env.NOTIFICATION_SERVICE_URL));
// app.use(proxy('/api/camps', process.env.CAMP_SERVICE_URL));
// app.use(proxy('/api/inventory', process.env.INVENTORY_SERVICE_URL));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('gateway running on port', PORT));