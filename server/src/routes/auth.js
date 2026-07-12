const router = require('express').Router();
const passport = require('passport');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/?error=auth_failed` }),
  authController.googleCallback
);

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;