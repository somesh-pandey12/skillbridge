const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, unique: true },
  avatar: String,
  skills: [String],
  targetCompanies: [String]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);