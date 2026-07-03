const router = require('express').Router();
const auth = require('../middleware/auth');
const axios = require('axios');

// Somu chatbot
router.post('/somu', auth, async (req, res) => {
  try {
    const { message, history } = req.body;
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/chat`,
      { message, history },
      { timeout: 30000 }
    );
    res.json({ reply: aiResponse.data.reply });
  } catch (err) {
    res.status(500).json({ reply: "I'm having trouble. Try again!" });
  }
});

// Interview questions
router.post('/interview-questions', auth, async (req, res) => {
  try {
    const { company, level } = req.body;
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/interview-questions`,
      { company, level },
      { timeout: 30000 }
    );
    res.json(aiResponse.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Interview feedback
router.post('/interview-feedback', auth, async (req, res) => {
  try {
    const { question, answer, company } = req.body;
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/interview-feedback`,
      { question, answer, company },
      { timeout: 30000 }
    );
    res.json(aiResponse.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cover letter
router.post('/cover-letter', auth, async (req, res) => {
  try {
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/cover-letter`,
      req.body,
      { timeout: 30000 }
    );
    res.json(aiResponse.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;