require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ service: 'notification-service', status: 'ok' }));

app.use('/internal/notifications', require('./routes/internal.routes'));
app.use('/api/notifications', require('./routes/public.routes'));

const PORT = process.env.PORT || 4005;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('notification-service connected to MongoDB');
    app.listen(PORT, () => console.log('notification-service running on port', PORT));
  })
  .catch((err) => console.error('notification-service failed to connect to MongoDB:', err.message));
