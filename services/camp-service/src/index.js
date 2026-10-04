require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'camp-service', status: 'ok' }));

// Mount routes here once you add them, e.g.:
// app.use('/api', require('./routes'));

const PORT = process.env.PORT || 4006;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('camp-service connected to MongoDB');
    app.listen(PORT, () => console.log('camp-service running on port', PORT));
  })
  .catch((err) => console.error('camp-service failed to connect to MongoDB:', err.message));
