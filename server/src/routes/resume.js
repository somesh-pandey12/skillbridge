const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const axios = require('axios');
const Resume = require('../models/Resume');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    // Send PDF buffer to Python AI service
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: 'application/pdf' });
    formData.append('file', blob, req.file.originalname);

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/parse-resume`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    const resume = await Resume.create({
      userId: req.user._id,
      ...aiResponse.data
    });

    res.json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/analysis/:id', auth, async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) return res.status(404).json({ message: 'Not found' });
  res.json(resume);
});

module.exports = router;