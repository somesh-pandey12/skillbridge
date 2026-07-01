import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import ResumeUploader from '../components/ResumeUploader';
import SkillGapCard from '../components/SkillGapCard';

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SB</span>
          </div>
          <span className="text-xl font-bold text-gray-900">SkillBridge</span>
        </div>
        <div className="flex items-center gap-4">
          {user?.avatar && <img src={user.avatar} className="w-8 h-8 rounded-full" />}
          <span className="text-gray-700 font-medium">{user?.name}</span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 text-sm transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mb-8">Upload your resume to get AI-powered skill gap analysis</p>

        {/* Upload Section */}
        {!analysis && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload Your Resume</h2>
            <ResumeUploader onAnalysisComplete={setAnalysis} />
          </div>
        )}

        {/* Results Section */}
        {analysis && (
          <div className="space-y-6">
            {/* Skills Found */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">✅ Skills Found in Your Resume</h2>
              <div className="flex flex-wrap gap-2">
                {analysis.parsedSkills?.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Gap Cards */}
            <h2 className="text-lg font-semibold text-gray-900">🎯 Skill Gap Analysis by Company</h2>
            <div className="grid grid-cols-2 gap-4">
              {analysis.skillGapAnalysis?.map((item, i) => (
                <SkillGapCard key={i} analysis={item} company={item.company} />
              ))}
            </div>

            {/* Upload another */}
            <button
              onClick={() => setAnalysis(null)}
              className="text-indigo-600 hover:underline text-sm"
            >
              Upload a different resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}