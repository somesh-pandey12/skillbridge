const router = require('express').Router();
const auth = require('../middleware/auth');
const axios = require('axios');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/somu', auth, aiLimiter, async (req, res) => {
  try {
    const { message, history } = req.body;
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/chat`,
      { message, history },
      { timeout: 120000 }
    );
    res.json({ reply: aiResponse.data.reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ reply: "I'm having trouble. Try again!" });
  }
});

router.post('/interview-questions', auth, aiLimiter, async (req, res) => {
  try {
    const { company, level } = req.body;
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/interview-questions`,
      { company, level },
      { timeout: 90000 }
    );
    res.json(aiResponse.data);
  } catch (err) {
    console.error('Interview questions error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/interview-feedback', auth, aiLimiter, async (req, res) => {
  try {
    const { question, answer, company } = req.body;
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/interview-feedback`,
      { question, answer, company },
      { timeout: 90000 }
    );
    res.json(aiResponse.data);
  } catch (err) {
    console.error('Interview feedback error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/cover-letter', auth, aiLimiter, async (req, res) => {
  try {
    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/cover-letter`,
      req.body,
      { timeout: 90000 }
    );
    res.json(aiResponse.data);
  } catch (err) {
    console.error('Cover letter error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;