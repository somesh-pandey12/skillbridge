const router = require('express').Router();
const auth = require('../middleware/auth');
const jobController = require('../controllers/jobController');
router.get('/', auth, jobController.getAllJobs);

// Get single job
router.get('/:id', auth, jobController.getJobById);
router.post('/seed', jobController.seedJobs);

module.exports = router;