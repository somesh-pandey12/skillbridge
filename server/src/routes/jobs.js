const router = require('express').Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');

// Get all jobs
router.get('/', auth, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single job
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed some sample jobs (temporary — testing ke liye)
router.post('/seed', async (req, res) => {
  try {
    await Job.deleteMany({});
    const jobs = await Job.insertMany([
      {
        title: 'Software Engineer',
        company: 'Google',
        location: 'Bangalore',
        type: 'Full-time',
        required_skills: ['Python', 'System Design', 'DSA', 'Go', 'Kubernetes'],
        description: 'Build scalable systems at Google scale.',
        salary: '25-40 LPA'
      },
      {
        title: 'SDE-2',
        company: 'Microsoft',
        location: 'Hyderabad',
        type: 'Full-time',
        required_skills: ['C++', 'Azure', 'System Design', 'React', 'TypeScript'],
        description: 'Work on Microsoft cloud products.',
        salary: '20-35 LPA'
      },
      {
        title: 'Backend Engineer',
        company: 'Amazon',
        location: 'Remote',
        type: 'Full-time',
        required_skills: ['Java', 'AWS', 'Microservices', 'DynamoDB', 'Spring Boot'],
        description: 'Build Amazon backend services.',
        salary: '18-30 LPA'
      },
      {
        title: 'Frontend Engineer',
        company: 'Flipkart',
        location: 'Bangalore',
        type: 'Full-time',
        required_skills: ['React', 'JavaScript', 'CSS', 'Redux', 'Performance Optimization'],
        description: 'Build Flipkart customer facing apps.',
        salary: '15-25 LPA'
      },
      {
        title: 'ML Engineer Intern',
        company: 'Groq',
        location: 'Remote',
        type: 'Internship',
        required_skills: ['Python', 'PyTorch', 'LLMs', 'FastAPI', 'Vector Databases'],
        description: 'Work on cutting edge AI infrastructure.',
        salary: '80-100k/month stipend'
      }
    ]);
    res.json({ message: `${jobs.length} jobs seeded`, jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;