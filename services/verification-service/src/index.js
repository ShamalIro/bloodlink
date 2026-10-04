require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'verification-service', status: 'ok' }));

// Mount routes here once you add them, e.g.:
// app.use('/api', require('./routes'));

const PORT = process.env.PORT || 4004;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('verification-service connected to MongoDB');
    app.listen(PORT, () => console.log('verification-service running on port', PORT));
  })
  .catch((err) => console.error('verification-service failed to connect to MongoDB:', err.message));
