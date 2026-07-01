const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const Resume = require('../models/Resume');

const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    console.log('Resume received:', req.file.originalname);

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: 'application/pdf'
    });
    // Voice resume analyze
router.post('/analyze-text', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.length < 30) {
      return res.status(400).json({ message: 'Text too short' });
    }

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/analyze-text`,
      { text },
      { timeout: 60000 }
    );

    const resume = await Resume.create({
      userId: req.user._id,
      originalText: text,
      parsedSkills: aiResponse.data.parsedSkills || [],
      experience: aiResponse.data.experience || [],
      education: aiResponse.data.education || [],
      vectorId: aiResponse.data.vectorId || '',
      skillGapAnalysis: []
    });

    res.json({
      _id: resume._id,
      parsedSkills: resume.parsedSkills,
      experience: resume.experience,
      education: resume.education,
      skillGapAnalysis: resume.skillGapAnalysis
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/parse-resume`,
      formData,
      { headers: formData.getHeaders(), timeout: 60000 }
    );

    const resume = await Resume.create({
      userId: req.user._id,
      originalText: aiResponse.data.originalText || '',
      parsedSkills: aiResponse.data.parsedSkills || [],
      experience: aiResponse.data.experience || [],
      education: aiResponse.data.education || [],
      vectorId: aiResponse.data.vectorId || '',
      skillGapAnalysis: []
    });

    res.json({
      _id: resume._id,
      parsedSkills: resume.parsedSkills,
      experience: resume.experience,
      education: resume.education,
      skillGapAnalysis: resume.skillGapAnalysis
    });

  } catch (err) {
    console.error('Resume upload error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI service not running. Start it first.' });
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;