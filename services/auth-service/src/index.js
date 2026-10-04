require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'auth-service', status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 4001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('auth-service connected to MongoDB');
    app.listen(PORT, () => console.log('auth-service running on port', PORT));
  })
  .catch((err) => console.error('auth-service failed to connect to MongoDB:', err.message));
