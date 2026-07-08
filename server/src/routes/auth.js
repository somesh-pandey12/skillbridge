const router = require('express').Router();
const passport = require('passport');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/?error=auth_failed' }),
  authController.googleCallback
);

// Email/Password Register
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;