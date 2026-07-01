import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import api from '../lib/api';
import ResumeUploader from '../components/ResumeUploader';
import SkillGapCard from '../components/SkillGapCard';
import SomuChat from '../components/SomuChat';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }

    api.get('/auth/me')
      .then(res => { setUser(res.data); setLoading(false); })
      .catch(() => { localStorage.removeItem('token'); navigate('/'); });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleVoiceClick = () => {
    toast('Voice feature coming soon! 🎤', {
      icon: '🚀',
      id: 'voice-toast',
      duration: 2000
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Toaster position="top-right" />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600 opacity-10 rounded-full blur-[120px]"/>
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600 opacity-10 rounded-full blur-[120px]"/>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 bg-white/3 border-b border-white/8 px-8 py-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <span className="text-white font-bold text-sm">CL</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            CareerLens AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user?.avatar && (
            <img src={user.avatar} className="w-8 h-8 rounded-full ring-2 ring-violet-500/30" />
          )}
          <span className="text-gray-300 font-medium text-sm">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-400 text-sm transition px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500">
            Upload your resume to get AI-powered skill gap analysis
          </p>
        </div>

        {/* Voice Upload Banner */}
        <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center text-xl">
              🎤
            </div>
            <div>
              <h3 className="font-semibold text-white mb-0.5">Voice Resume Upload</h3>
              <p className="text-sm text-gray-500">
                Speak your experience — AI will analyze it instantly
              </p>
            </div>
          </div>
          <button
            onClick={handleVoiceClick}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-violet-500/25 whitespace-nowrap"
          >
            Try Voice →
          </button>
        </div>

        {/* Upload Section */}
        {!analysis && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 mb-8 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-2">
              📄 Upload Your Resume
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              PDF format only · Max 5MB · Analysis takes ~15 seconds
            </p>
            <ResumeUploader onAnalysisComplete={setAnalysis} />
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-4">
                ✅ Skills Found in Your Resume
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.parsedSkills?.length > 0 ? (
                  analysis.parsedSkills.map(skill => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills detected</p>
                )}
              </div>
            </div>

            {analysis.skillGapAnalysis?.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-white">
                  🎯 Skill Gap Analysis by Company
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {analysis.skillGapAnalysis.map((item, i) => (
                    <SkillGapCard key={i} analysis={item} company={item.company} />
                  ))}
                </div>
              </>
            )}

            <button
              onClick={() => setAnalysis(null)}
              className="text-violet-400 hover:text-violet-300 text-sm underline underline-offset-4 transition"
            >
              ← Upload a different resume
            </button>
          </div>
        )}
      </div>

      {/* Somu Chatbot */}
      <SomuChat />
    </div>
  );
}