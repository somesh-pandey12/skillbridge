import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate as useNav } from 'react-router-dom';
import Layout from '../components/Layout';
import ResumeUploader from '../components/ResumeUploader';
import SkillGapCard from '../components/SkillGapCard';
import VoiceRecorder from '../components/VoiceRecorder';
import api from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVoice, setShowVoice] = useState(false);
  const [analyzingGap, setAnalyzingGap] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    api.get('/auth/me')
      .then(res => { setUser(res.data); setLoading(false); })
      .catch(() => { localStorage.removeItem('token'); navigate('/'); });
  }, []);

  const handleAnalysisComplete = async (data) => {
    setAnalysis(data);
    if (data.parsedSkills?.length > 0) {
      await runSkillGapAnalysis(data);
    }
  };

  const runSkillGapAnalysis = async (data) => {
    setAnalyzingGap(true);
    const companies = [
      { company: 'Google', role: 'Software Engineer', required_skills: ['Python', 'System Design', 'DSA', 'Go', 'Kubernetes'] },
      { company: 'Microsoft', role: 'SDE-2', required_skills: ['C++', 'Azure', 'System Design', 'React', 'TypeScript'] },
      { company: 'Amazon', role: 'Backend Engineer', required_skills: ['Java', 'AWS', 'Microservices', 'DynamoDB', 'Spring Boot'] },
      { company: 'Flipkart', role: 'Frontend Engineer', required_skills: ['React', 'JavaScript', 'CSS', 'Redux', 'Performance'] },
    ];

    try {
      const gapResults = await Promise.all(
        companies.map(company =>
          api.post('/resume/skill-gap', {
            candidateSkills: data.parsedSkills,
            jobRequirements: company
          }).then(res => ({ ...res.data, company: company.company, role: company.role }))
        )
      );
      setAnalysis(prev => ({ ...prev, skillGapAnalysis: gapResults }));
    } catch (err) {
      console.error('Skill gap error:', err);
    } finally {
      setAnalyzingGap(false);
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

  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500">Upload your resume to get AI-powered skill gap analysis</p>
        </div>

        {/* Score Card — shows after analysis */}
        {analysis && (
          <div className="grid grid-cols-4 gap-4 mb-8">
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
            <p className="text-gray-500 text-sm mb-6">PDF format only · Max 5MB · Analysis takes ~15 seconds</p>
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

            {/* Skill Gap Analysis */}
            {analyzingGap && (
              <div className="bg-white/3 border border-white/8 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
                <div>
                  <p className="text-white font-medium">Analyzing skill gaps...</p>
                  <p className="text-gray-500 text-sm">Comparing with Google, Microsoft, Amazon, Flipkart</p>
                </div>
              </div>
            )}

            {analysis.skillGapAnalysis?.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-white">🎯 Skill Gap Analysis by Company</h2>
                <div className="grid grid-cols-2 gap-4">
                  {analysis.skillGapAnalysis.map((item, i) => (
                    <SkillGapCard key={i} analysis={item} company={item.company} role={item.role} />
                  ))}
                </div>
              </>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
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
              onClick={() => setAnalysis(null)}
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