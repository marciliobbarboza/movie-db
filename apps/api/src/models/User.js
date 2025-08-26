// apps/api/src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie', default: [] }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  avatar: {
    data: Buffer,
    contentType: String,
    updatedAt: Date
  }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
