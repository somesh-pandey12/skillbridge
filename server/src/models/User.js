const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: { type: String },
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String },
  avatar: String,
  skills: [String],
  targetCompanies: [String]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);