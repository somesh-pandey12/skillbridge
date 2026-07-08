import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from '../components/Layout';
import ResumeUploader from '../components/ResumeUploader';
import SkillGapCard from '../components/SkillGapCard';
import VoiceRecorder from '../components/VoiceRecorder';
import api from '../lib/api';

const TARGET_COMPANIES = [
  { company: 'Google', role: 'Software Engineer', required_skills: ['Python', 'System Design', 'DSA', 'Go', 'Kubernetes'] },
  { company: 'Microsoft', role: 'SDE-2', required_skills: ['C++', 'Azure', 'System Design', 'React', 'TypeScript'] },
  { company: 'Amazon', role: 'Backend Engineer', required_skills: ['Java', 'AWS', 'Microservices', 'DynamoDB', 'Spring Boot'] },
  { company: 'Flipkart', role: 'Frontend Engineer', required_skills: ['React', 'JavaScript', 'CSS', 'Redux', 'Performance'] },
  { company: 'Tata Consultancy Services (TCS)', role: 'SDE-1', required_skills: ['Java', 'SQL', 'Spring Boot', 'REST APIs'] },
  { company: 'Infosys', role: 'Systems Engineer', required_skills: ['Java', 'SQL', 'Cloud Basics', 'Problem Solving'] },
  { company: 'Wipro', role: 'Software Developer', required_skills: ['C#', '.NET', 'SQL Server', 'Azure'] },
  { company: 'HCLTech', role: 'Associate Software Engineer', required_skills: ['Java', 'Python', 'SQL', 'Git'] },
  { company: 'Tech Mahindra', role: 'Technology Analyst', required_skills: ['Java', 'Networking', 'Cloud', 'SQL'] },
  { company: 'Cognizant', role: 'Software Engineer', required_skills: ['Java', 'Spring Boot', 'Microservices', 'AWS'] },
  { company: 'Accenture', role: 'Data Engineer', required_skills: ['Python', 'SQL', 'Spark', 'Azure Data Factory'] },
  { company: 'Zoho', role: 'Backend Developer', required_skills: ['Java', 'MySQL', 'Data Structures', 'REST APIs'] },
  { company: 'Freshworks', role: 'Product Engineer', required_skills: ['Ruby on Rails', 'JavaScript', 'MySQL', 'System Design'] },
  { company: 'Swiggy', role: 'SDE-2', required_skills: ['Java', 'Microservices', 'Kafka', 'System Design'] },
  { company: 'Zomato', role: 'Backend Engineer', required_skills: ['Node.js', 'MongoDB', 'System Design', 'Redis'] },
  { company: 'Paytm', role: 'SDE-2', required_skills: ['Java', 'Kafka', 'Microservices', 'MySQL'] },
  { company: 'PhonePe', role: 'Software Engineer', required_skills: ['Java', 'Go', 'Distributed Systems', 'Kafka'] },
  { company: 'Razorpay', role: 'Backend Engineer', required_skills: ['Golang', 'Java', 'Distributed Systems', 'SQL'] },
  { company: 'CRED', role: 'Full Stack Developer', required_skills: ['React', 'Node.js', 'TypeScript', 'System Design'] },
  { company: 'Meesho', role: 'SDE-1', required_skills: ['Java', 'Spring Boot', 'AWS', 'Microservices'] },
  { company: 'Ola', role: 'Software Development Engineer', required_skills: ['Java', 'Kotlin', 'Microservices', 'System Design'] },
  { company: 'Myntra', role: 'Backend Engineer', required_skills: ['Java', 'Spring Boot', 'MySQL', 'Microservices'] },
  { company: 'Zerodha', role: 'DevOps Engineer', required_skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD'] },
  { company: 'Groww', role: 'Software Engineer', required_skills: ['Kotlin', 'Java', 'System Design', 'AWS'] },
  { company: 'Dream11', role: 'Backend Engineer', required_skills: ['Java', 'Kafka', 'Redis', 'System Design'] },
];

const BATCH_SIZE = 10;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVoice, setShowVoice] = useState(false);
  const [analyzingGap, setAnalyzingGap] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [gapProgress, setGapProgress] = useState({ done: 0, total: 0 });
  const [analyzedCount, setAnalyzedCount] = useState(0);
  const [candidateSkills, setCandidateSkills] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    api.get('/auth/me')
      .then(res => { setUser(res.data); setLoading(false); })
      .catch(() => { localStorage.removeItem('token'); navigate('/'); });
  }, [navigate]);

  // Analyze a batch of companies against the candidate's skills
  const analyzeBatch = async (skills, batch, onProgress) => {
    const results = await Promise.all(
      batch.map(company =>
        api.post('/resume/skill-gap', {
          candidateSkills: skills,
          jobRequirements: company
        })
          .then(res => ({ ...res.data, company: company.company, role: company.role }))
          .catch(() => ({
            company: company.company,
            role: company.role,
            match_score: 0,
            missing_skills: company.required_skills,
            strong_matches: [],
            recommendations: [],
            leetcode_topics: [],
            hiring_probability: 'Unknown',
            error: true
          }))
          .finally(() => onProgress())
      )
    );
    return results;
  };

  const handleAnalysisComplete = async (data) => {
    setAnalysis(data);
    if (data.parsedSkills?.length > 0) {
      setCandidateSkills(data.parsedSkills);
      await runInitialAnalysis(data.parsedSkills);
    }
  };

  const runInitialAnalysis = async (skills) => {
    setAnalyzingGap(true);
    const firstBatch = TARGET_COMPANIES.slice(0, BATCH_SIZE);
    setGapProgress({ done: 0, total: firstBatch.length });

    try {
      const results = await analyzeBatch(skills, firstBatch, () =>
        setGapProgress(prev => ({ ...prev, done: prev.done + 1 }))
      );
      results.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      setAnalysis(prev => ({ ...prev, skillGapAnalysis: results }));
      setAnalyzedCount(firstBatch.length);
    } catch (err) {
      console.error('Skill gap error:', err);
    } finally {
      setAnalyzingGap(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;
    const nextBatch = TARGET_COMPANIES.slice(analyzedCount, analyzedCount + BATCH_SIZE);
    if (nextBatch.length === 0) return;

    setLoadingMore(true);
    setGapProgress({ done: 0, total: nextBatch.length });

    try {
      const results = await analyzeBatch(candidateSkills, nextBatch, () =>
        setGapProgress(prev => ({ ...prev, done: prev.done + 1 }))
      );
      setAnalysis(prev => {
        const combined = [...(prev.skillGapAnalysis || []), ...results];
        combined.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
        return { ...prev, skillGapAnalysis: combined };
      });
      setAnalyzedCount(prev => prev + nextBatch.length);
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Score calculation
  const getResumeScore = () => {
    if (!analysis?.parsedSkills) return 0;
    const skillScore = Math.min(analysis.parsedSkills.length * 3, 40);
    const expScore = analysis.experience?.length > 0 ? 30 : 10;
    const eduScore = analysis.education?.length > 0 ? 20 : 5;
    const projectScore = analysis.parsedSkills.length > 10 ? 10 : 5;
    return Math.min(skillScore + expScore + eduScore + projectScore, 100);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  const score = getResumeScore();
  const remainingCount = TARGET_COMPANIES.length - analyzedCount;

  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500">Upload your resume to get AI-powered skill gap analysis</p>
        </div>

        {/* Score Card — shows after analysis */}
        {analysis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Resume Score', value: `${score}/100`, color: score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400', icon: '⭐' },
              { label: 'Skills Found', value: analysis.parsedSkills?.length || 0, color: 'text-violet-400', icon: '🛠️' },
              { label: 'Companies Matched', value: analysis.skillGapAnalysis?.length || 0, color: 'text-blue-400', icon: '🏢' },
              { label: 'Best Match', value: analysis.skillGapAnalysis?.length > 0 ? `${Math.max(...analysis.skillGapAnalysis.map(g => g.match_score || 0))}%` : 'N/A', color: 'text-cyan-400', icon: '🎯' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/3 border border-white/8 rounded-2xl p-4">
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Voice Banner */}
        <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center text-xl">🎤</div>
            <div>
              <h3 className="font-semibold text-white mb-0.5">Voice Resume Upload</h3>
              <p className="text-sm text-gray-500">Speak your experience — AI will analyze it instantly</p>
            </div>
          </div>
          <button
            onClick={() => setShowVoice(!showVoice)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-violet-500/25"
          >
            {showVoice ? 'Close Voice' : 'Try Voice →'}
          </button>
        </div>

        {/* Voice Recorder */}
        {showVoice && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">🎤 Voice Resume</h3>
            <VoiceRecorder onAnalysisComplete={(data) => {
              handleAnalysisComplete(data);
              setShowVoice(false);
            }} />
          </div>
        )}

        {/* Upload Section */}
        {!analysis && !showVoice && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 mb-8">
            <h2 className="text-lg font-semibold text-white mb-2">📄 Upload Your Resume</h2>
            <p className="text-gray-500 text-sm mb-6">PDF format only · Max 5MB · Analysis takes ~10 seconds</p>
            <ResumeUploader onAnalysisComplete={handleAnalysisComplete} />
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">✅ Skills Found in Your Resume</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.parsedSkills?.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Gap Analysis — initial loading state */}
            {analyzingGap && (
              <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
                  <div>
                    <p className="text-white font-medium">Analyzing skill gaps...</p>
                    <p className="text-gray-500 text-sm">
                      Checking top {gapProgress.total} companies first ({gapProgress.done}/{gapProgress.total})
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${gapProgress.total ? (gapProgress.done / gapProgress.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}

            {!analyzingGap && analysis.skillGapAnalysis?.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">🎯 Skill Gap Analysis by Company</h2>
                  <span className="text-gray-500 text-sm">
                    {analysis.skillGapAnalysis.length}/{TARGET_COMPANIES.length} companies · sorted by best match
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.skillGapAnalysis.map((item, i) => (
                    <SkillGapCard key={`${item.company}-${i}`} analysis={item} company={item.company} role={item.role} />
                  ))}
                </div>

                {/* Load More */}
                {remainingCount > 0 && (
                  <div className="flex flex-col items-center gap-3 pt-2">
                    {loadingMore && (
                      <div className="w-full max-w-sm h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300"
                          style={{ width: `${gapProgress.total ? (gapProgress.done / gapProgress.total) * 100 : 0}%` }}
                        />
                      </div>
                    )}
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-white text-sm font-medium rounded-xl transition flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Analyzing {gapProgress.done}/{gapProgress.total}...
                        </>
                      ) : (
                        `Load More Companies (${remainingCount} remaining) →`
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '💼', label: 'View Job Matches', path: '/jobs', color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20' },
                { icon: '🎯', label: 'Practice Interview', path: '/interview', color: 'from-green-500/10 to-emerald-500/10 border-green-500/20' },
                { icon: '✉️', label: 'Generate Cover Letter', path: '/cover-letter', color: 'from-orange-500/10 to-yellow-500/10 border-orange-500/20' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className={`bg-gradient-to-r ${action.color} border rounded-2xl p-4 text-left hover:opacity-80 transition`}
                >
                  <span className="text-2xl block mb-2">{action.icon}</span>
                  <span className="text-white font-medium text-sm">{action.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setAnalysis(null);
                setAnalyzedCount(0);
                setCandidateSkills([]);
              }}
              className="text-violet-400 hover:text-violet-300 text-sm underline underline-offset-4 transition"
            >
              ← Upload a different resume
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}