const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: String,
  type: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Remote'] },
  required_skills: [String],
  description: String,
  salary: String,
  vectorId: String
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);