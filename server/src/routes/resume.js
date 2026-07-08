const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const resumeController = require('../controllers/resumeController');
const { aiLimiter } = require('../middleware/rateLimiter');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ─── PDF Upload ───
router.post('/upload', auth, aiLimiter, upload.single('resume'), resumeController.uploadResume);

router.post('/skill-gap', auth, aiLimiter, resumeController.getSkillGap);
router.post('/analyze-text', auth, aiLimiter, resumeController.analyzeText);

router.get('/:id', auth, resumeController.getResumeById);
router.get('/', auth, resumeController.getAllResumes);

module.exports = router;