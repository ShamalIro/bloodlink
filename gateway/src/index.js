
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

// Do not use express.json() before proxy middleware.
// This allows the proxy to forward request bodies correctly.

app.get('/health', (req, res) => {
  res.json({
    service: 'gateway',
    status: 'ok',
  });
});

// Create a proxy while preserving the original request path.
const proxy = (path, target) => {
  if (!target) {
    throw new Error(`Missing service URL for ${path}`);
  }

  return createProxyMiddleware({
    target,
    pathFilter: path,
    changeOrigin: true,
  });
};

// Authentication Service - Port 4001
app.use(
  proxy('/api/auth', process.env.AUTH_SERVICE_URL)
);

// Request Service - Port 4003
app.use(
  proxy('/api/requests', process.env.REQUEST_SERVICE_URL)
);

// Donor Service - Port 4002
app.use(
  proxy('/api/donors', process.env.DONOR_SERVICE_URL)
);

// Verification Service - Port 4004
app.use(
  proxy('/api/verification', process.env.VERIFICATION_SERVICE_URL)
);

// Notification Service - Port 4005
app.use(
  proxy('/api/notifications', process.env.NOTIFICATION_SERVICE_URL)
);

// Camp Service - Port 4006
app.use(
  proxy('/api/camps', process.env.CAMP_SERVICE_URL)
);

// Inventory Service - Port 4007
app.use(
  proxy('/api/inventory', process.env.INVENTORY_SERVICE_URL)
);

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`gateway running on port ${PORT}`);
});
