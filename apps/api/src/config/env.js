const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL || ''
};

module.exports = env;
