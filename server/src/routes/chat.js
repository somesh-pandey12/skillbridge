const router = require('express').Router();
const auth = require('../middleware/auth');
const axios = require('axios');

router.post('/somu', auth, async (req, res) => {
  try {
    const { message, history } = req.body;

    console.log('Somu chat request:', message);

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/chat`,
      { message, history },
      { timeout: 30000 }
    );

    res.json({ reply: aiResponse.data.reply });
  } catch (err) {
    console.error('Somu chat error:', err.message);
    res.status(500).json({ 
      reply: "I'm having trouble right now. Please try again!" 
    });
  }
});

module.exports = router;