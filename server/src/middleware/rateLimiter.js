const rateLimit = require('express-rate-limit');

const handler = (req, res) => {
  res.status(429).json({
    message: 'Too many requests. Please slow down and try again in a bit.'
  });
};

// ─── General limiter — applied to every /api/* request ───
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
  skipSuccessfulRequests: true 
});

// ─── AI limiter — Groq/Pinecone calls, strictest tier ───
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler
});

module.exports = { generalLimiter, authLimiter, aiLimiter };