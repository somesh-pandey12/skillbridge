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

// ─── PDF Upload ───
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Resume received:', req.file.originalname);

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: 'application/pdf'
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
      return res.status(503).json({ message: 'AI service not running. Please start it first.' });
    }
    if (err.response?.data?.detail) {
      return res.status(400).json({ message: err.response.data.detail });
    }
    res.status(500).json({ message: err.message });
  }
});
  
// Skill gap analysis
router.post('/skill-gap', auth, async (req, res) => {
  try {
    const { candidateSkills, jobRequirements } = req.body;
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/skill-gap`,
      { candidateSkills, jobRequirements },
      { timeout: 30000 }
    );
    res.json(aiResponse.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Voice / Text Analyze ───
router.post('/analyze-text', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 30) {
      return res.status(400).json({ message: 'Please speak more about your experience!' });
    }

    console.log('Voice text received, length:', text.length);

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
    console.error('Voice analyze error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ message: 'AI service not running. Please start it first.' });
    }
    if (err.response?.data?.detail) {
      return res.status(400).json({ message: err.response.data.detail });
    }
    res.status(500).json({ message: err.message });
  }
});

// ─── Get Resume by ID ───
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Get All Resumes for User ───
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;