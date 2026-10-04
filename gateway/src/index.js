require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());

app.get('/health', (req, res) => res.json({ service: 'gateway', status: 'ok' }));

// Add a proxy line per service as you bring each one online.
// The mobile app only ever talks to the gateway, never to a service directly.
app.use('/api/auth', createProxyMiddleware({ target: process.env.AUTH_SERVICE_URL, changeOrigin: true }));
// app.use('/api/donors', createProxyMiddleware({ target: process.env.DONOR_SERVICE_URL, changeOrigin: true }));
// app.use('/api/requests', createProxyMiddleware({ target: process.env.REQUEST_SERVICE_URL, changeOrigin: true }));
// app.use('/api/verification', createProxyMiddleware({ target: process.env.VERIFICATION_SERVICE_URL, changeOrigin: true }));
// app.use('/api/notifications', createProxyMiddleware({ target: process.env.NOTIFICATION_SERVICE_URL, changeOrigin: true }));
// app.use('/api/camps', createProxyMiddleware({ target: process.env.CAMP_SERVICE_URL, changeOrigin: true }));
// app.use('/api/inventory', createProxyMiddleware({ target: process.env.INVENTORY_SERVICE_URL, changeOrigin: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('gateway running on port', PORT));
