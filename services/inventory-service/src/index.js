require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'inventory-service', status: 'ok' }));

app.use('/api/inventory', require('./routes/inventory.routes'));

const PORT = process.env.PORT || 4007;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('inventory-service connected to MongoDB');
    app.listen(PORT, () => console.log('inventory-service running on port', PORT));
  })
  .catch((err) => console.error('inventory-service failed to connect to MongoDB:', err.message));