import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('home'); // home | login | register
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleGoogleLogin = () => {
    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    window.location.href = `${serverUrl}/api/auth/google`;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const { data } = await api.post(endpoint, payload);
      localStorage.setItem('token', data.token);
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ─── HOME PAGE ───
  if (mode === 'home') return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600 opacity-10 rounded-full blur-[120px]"/>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600 opacity-10 rounded-full blur-[120px]"/>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <span className="text-white font-bold text-sm">CL</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            CareerLens AI
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('login')}
            className="px-5 py-2 text-sm text-gray-400 hover:text-white transition"
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition shadow-lg shadow-violet-500/25"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-6xl mx-auto px-10 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 rounded-full text-violet-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"/>
          Powered by Groq AI + LLaMA 3.3 — Free & Fast
        </div>

        <h1 className="text-6xl font-bold mb-6 leading-tight tracking-tight">
          Your Resume.
          <br/>
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Reimagined by AI.
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your resume and instantly discover skill gaps, get company-specific
          recommendations, and know exactly which LeetCode topics to grind.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16">
          <button
            onClick={() => setMode('register')}
            className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl transition shadow-xl shadow-violet-500/25 text-lg"
          >
            Analyze My Resume →
          </button>
          <button
            onClick={handleGoogleLogin}
            className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition flex items-center gap-2"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4"/>
            Continue with Google
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-12 mb-20 text-center">
          {[
            { num: '95%', label: 'Accuracy Rate' },
            { num: '<20s', label: 'Analysis Time' },
            { num: '50+', label: 'Companies Covered' },
            { num: 'Free', label: 'Forever Plan' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-2xl font-bold text-white">{s.num}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-5">
          {[
            {
              icon: '🧠',
              title: 'AI Resume Parser',
              desc: 'Groq LLaMA 3.3 extracts skills, experience, and education from any resume format instantly.',
              badge: 'Groq Powered'
            },
            {
              icon: '🎯',
              title: 'Skill Gap Analysis',
              desc: 'Compare your profile against Google, Microsoft, Amazon job requirements in real time.',
              badge: 'Company Specific'
            },
            {
              icon: '📊',
              title: 'LeetCode Roadmap',
              desc: 'Get a personalized list of DSA topics to practice based on your target company.',
              badge: 'DSA Focused'
            },
            {
              icon: '🎤',
              title: 'Voice Resume',
              desc: 'Speak your experience and let AI convert it into a structured resume analysis.',
              badge: 'Coming Soon'
            },
            {
              icon: '🔍',
              title: 'Semantic Job Match',
              desc: 'Vector search finds jobs that truly match your skills, not just keyword matches.',
              badge: 'Pinecone DB'
            },
            {
              icon: '📈',
              title: 'Progress Tracking',
              desc: 'Track your skill improvement over time and see how your match score grows.',
              badge: 'Dashboard'
            },
          ].map((f, i) => (
            <div key={i} className="bg-white/3 border border-white/8 rounded-2xl p-6 text-left hover:border-violet-500/30 hover:bg-white/5 transition group">
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="inline-block bg-violet-500/10 text-violet-400 text-xs px-2 py-0.5 rounded-full mb-2">
                {f.badge}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-white/5 px-10 py-6 text-center text-gray-600 text-sm">
        © 2025 CareerLens AI · Built with Groq + Pinecone + MongoDB
      </div>
    </div>
  );

  // ─── LOGIN / REGISTER FORM ───
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600 opacity-10 rounded-full blur-[120px]"/>
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600 opacity-10 rounded-full blur-[120px]"/>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 mx-auto mb-3">
            <span className="text-white font-bold">CL</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' ? 'Sign in to your CareerLens account' : 'Start analyzing your resume for free'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl transition mb-6 font-medium"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4"/>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10"/>
            <span className="text-gray-600 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10"/>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                  minLength={8}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-gray-600 text-sm mt-6">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-violet-400 hover:text-violet-300 font-medium transition"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-gray-700 text-xs mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>

        <button
          onClick={() => setMode('home')}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-400 text-sm mx-auto mt-4 transition"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}