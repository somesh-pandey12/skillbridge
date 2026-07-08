const Job = require('../models/Job');

// ─── Get all jobs ───
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Get single job by id ───
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Seed sample jobs — top Indian + India-hiring companies (testing ke liye) ───
exports.seedJobs = async (req, res) => {
  try {
    await Job.deleteMany({});
    const jobs = await Job.insertMany([
      { title: 'Software Engineer', company: 'Google', location: 'Bangalore', type: 'Full-time', required_skills: ['Python', 'System Design', 'DSA', 'Go', 'Kubernetes'], description: 'Build scalable systems at Google scale.', salary: '25-40 LPA' },
      { title: 'SDE-2', company: 'Microsoft', location: 'Hyderabad', type: 'Full-time', required_skills: ['C++', 'Azure', 'System Design', 'React', 'TypeScript'], description: 'Work on Microsoft cloud products.', salary: '20-35 LPA' },
      { title: 'Backend Engineer', company: 'Amazon', location: 'Remote', type: 'Full-time', required_skills: ['Java', 'AWS', 'Microservices', 'DynamoDB', 'Spring Boot'], description: 'Build Amazon backend services.', salary: '18-30 LPA' },
      { title: 'Frontend Engineer', company: 'Flipkart', location: 'Bangalore', type: 'Full-time', required_skills: ['React', 'JavaScript', 'CSS', 'Redux', 'Performance Optimization'], description: 'Build Flipkart customer facing apps.', salary: '15-25 LPA' },
      { title: 'ML Engineer Intern', company: 'Groq', location: 'Remote', type: 'Internship', required_skills: ['Python', 'PyTorch', 'LLMs', 'FastAPI', 'Vector Databases'], description: 'Work on cutting edge AI infrastructure.', salary: '80-100k/month stipend' },
      { title: 'SDE-1', company: 'Tata Consultancy Services (TCS)', location: 'Pune', type: 'Full-time', required_skills: ['Java', 'SQL', 'Spring Boot', 'REST APIs'], description: 'Deliver enterprise software solutions for global clients.', salary: '6-12 LPA' },
      { title: 'Systems Engineer', company: 'Infosys', location: 'Bangalore', type: 'Full-time', required_skills: ['Java', 'SQL', 'Cloud Basics', 'Problem Solving'], description: 'Build and maintain enterprise applications.', salary: '5-10 LPA' },
      { title: 'Software Developer', company: 'Wipro', location: 'Chennai', type: 'Full-time', required_skills: ['C#', '.NET', 'SQL Server', 'Azure'], description: 'Develop and support enterprise software products.', salary: '5-9 LPA' },
      { title: 'Associate Software Engineer', company: 'HCLTech', location: 'Noida', type: 'Full-time', required_skills: ['Java', 'Python', 'SQL', 'Git'], description: 'Work on IT services and product engineering projects.', salary: '5-10 LPA' },
      { title: 'Technology Analyst', company: 'Tech Mahindra', location: 'Pune', type: 'Full-time', required_skills: ['Java', 'Networking', 'Cloud', 'SQL'], description: 'Support telecom and enterprise technology solutions.', salary: '5-9 LPA' },
      { title: 'Software Engineer', company: 'Cognizant', location: 'Chennai', type: 'Full-time', required_skills: ['Java', 'Spring Boot', 'Microservices', 'AWS'], description: 'Build digital solutions for global clients.', salary: '6-11 LPA' },
      { title: 'Data Engineer', company: 'Accenture', location: 'Bangalore', type: 'Full-time', required_skills: ['Python', 'SQL', 'Spark', 'Azure Data Factory'], description: 'Design and build data pipelines for enterprise clients.', salary: '8-15 LPA' },
      { title: 'Backend Developer', company: 'Zoho', location: 'Chennai', type: 'Full-time', required_skills: ['Java', 'MySQL', 'Data Structures', 'REST APIs'], description: 'Build core modules for Zoho SaaS products.', salary: '10-18 LPA' },
      { title: 'Product Engineer', company: 'Freshworks', location: 'Chennai', type: 'Full-time', required_skills: ['Ruby on Rails', 'JavaScript', 'MySQL', 'System Design'], description: 'Build customer engagement SaaS products.', salary: '12-22 LPA' },
      { title: 'SDE-2', company: 'Swiggy', location: 'Bangalore', type: 'Full-time', required_skills: ['Java', 'Microservices', 'Kafka', 'System Design'], description: 'Scale food delivery and logistics platform.', salary: '20-35 LPA' },
      { title: 'Backend Engineer', company: 'Zomato', location: 'Gurugram', type: 'Full-time', required_skills: ['Node.js', 'MongoDB', 'System Design', 'Redis'], description: 'Build high-scale food-tech backend systems.', salary: '18-32 LPA' },
      { title: 'SDE-2', company: 'Paytm', location: 'Noida', type: 'Full-time', required_skills: ['Java', 'Kafka', 'Microservices', 'MySQL'], description: 'Build fintech and payments infrastructure.', salary: '16-28 LPA' },
      { title: 'Software Engineer', company: 'PhonePe', location: 'Bangalore', type: 'Full-time', required_skills: ['Java', 'Go', 'Distributed Systems', 'Kafka'], description: 'Build large-scale digital payments systems.', salary: '20-35 LPA' },
      { title: 'Backend Engineer', company: 'Razorpay', location: 'Bangalore', type: 'Full-time', required_skills: ['Golang', 'Java', 'Distributed Systems', 'SQL'], description: 'Build payment gateway and fintech infra.', salary: '20-38 LPA' },
      { title: 'Full Stack Developer', company: 'CRED', location: 'Bangalore', type: 'Full-time', required_skills: ['React', 'Node.js', 'TypeScript', 'System Design'], description: 'Build premium fintech consumer products.', salary: '25-45 LPA' },
      { title: 'SDE-1', company: 'Meesho', location: 'Bangalore', type: 'Full-time', required_skills: ['Java', 'Spring Boot', 'AWS', 'Microservices'], description: 'Build e-commerce platform for Bharat.', salary: '15-28 LPA' },
      { title: 'Software Development Engineer', company: 'Ola', location: 'Bangalore', type: 'Full-time', required_skills: ['Java', 'Kotlin', 'Microservices', 'System Design'], description: 'Build mobility and ride-hailing platform.', salary: '14-26 LPA' },
      { title: 'Backend Engineer', company: 'Myntra', location: 'Bangalore', type: 'Full-time', required_skills: ['Java', 'Spring Boot', 'MySQL', 'Microservices'], description: 'Build fashion e-commerce platform at scale.', salary: '16-28 LPA' },
      { title: 'Data Scientist', company: 'Flipkart', location: 'Bangalore', type: 'Full-time', required_skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'], description: 'Build recommendation and pricing ML models.', salary: '20-35 LPA' },
      { title: 'DevOps Engineer', company: 'Zerodha', location: 'Bangalore', type: 'Full-time', required_skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD'], description: "Manage infra for India's largest stockbroker.", salary: '18-30 LPA' },
      { title: 'Software Engineer', company: 'Groww', location: 'Bangalore', type: 'Full-time', required_skills: ['Kotlin', 'Java', 'System Design', 'AWS'], description: 'Build investment and wealth-tech platform.', salary: '18-30 LPA' },
      { title: 'Backend Engineer', company: 'Dream11', location: 'Mumbai', type: 'Full-time', required_skills: ['Java', 'Kafka', 'Redis', 'System Design'], description: "Build India's largest fantasy sports platform.", salary: '20-35 LPA' },
      { title: 'SDE-2', company: "BYJU'S", location: 'Bangalore', type: 'Full-time', required_skills: ['Java', 'React', 'MySQL', 'AWS'], description: 'Build ed-tech learning platform.', salary: '14-24 LPA' },
      { title: 'ML Engineer', company: 'Sarvam AI', location: 'Bangalore', type: 'Full-time', required_skills: ['Python', 'PyTorch', 'LLMs', 'NLP'], description: 'Build foundational AI models for India.', salary: '25-45 LPA' },
      { title: 'Backend Engineer', company: 'Postman', location: 'Bangalore', type: 'Full-time', required_skills: ['Node.js', 'Java', 'System Design', 'AWS'], description: "Build the world's leading API platform.", salary: '25-45 LPA' },
      { title: 'Software Engineer', company: 'Adobe', location: 'Noida', type: 'Full-time', required_skills: ['C++', 'Java', 'Data Structures', 'System Design'], description: 'Build Adobe Creative Cloud products.', salary: '20-35 LPA' },
      { title: 'ML Engineer Intern', company: 'Sprinklr', location: 'Gurugram', type: 'Internship', required_skills: ['Python', 'Machine Learning', 'NLP', 'SQL'], description: 'Work on customer experience AI products.', salary: '40-60k/month stipend' }
    ]);
    res.json({ message: `${jobs.length} jobs seeded`, jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};