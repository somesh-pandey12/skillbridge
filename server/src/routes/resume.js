const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const resumeController = require('../controllers/resumeController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ─── PDF Upload ───
router.post('/upload', auth, upload.single('resume'), resumeController.uploadResume);

router.post('/skill-gap', auth, resumeController.getSkillGap);
router.post('/analyze-text', auth, resumeController.analyzeText);

router.get('/:id', auth, resumeController.getResumeById);
router.get('/', auth, resumeController.getAllResumes);

module.exports = router;