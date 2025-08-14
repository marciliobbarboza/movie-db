const mongoose = require('mongoose');
const env = require('../config/env');

async function connectMongo() {
  await mongoose.connect(env.MONGO_URL);
  const { connection } = mongoose;

  connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  connection.on('error', (err) => {
    console.log('MongoDB error:', err.message);
  });

  connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });
}

module.exports = { connectMongo };
