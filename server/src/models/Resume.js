const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  originalText: String,
  parsedSkills: [String],
  experience: [{ title: String, company: String, duration: String }],
  education: [{ degree: String, institution: String }],
  skillGapAnalysis: [{
    company: String,
    requiredSkills: [String],
    missingSkills: [String],
    matchScore: Number
  }],
  vectorId: String    // Pinecone vector ID
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);