require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'donor-service', status: 'ok' }));

app.use('/api/donors', require('./routes/donor.routes'));
// Not exposed through the gateway: only other services call this.
app.use('/internal/donors', require('./routes/internal.routes'));

if (!process.env.QR_SECRET) console.warn('WARNING: QR_SECRET is not set - /me/qr will fail.');
if (!process.env.INTERNAL_API_KEY) console.warn('WARNING: INTERNAL_API_KEY is not set - internal routes are locked.');

const PORT = process.env.PORT || 4002;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('donor-service connected to MongoDB');
    app.listen(PORT, () => console.log('donor-service running on port', PORT));
  })
  .catch((err) => console.error('donor-service failed to connect to MongoDB:', err.message));