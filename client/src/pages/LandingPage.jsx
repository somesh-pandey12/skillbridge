import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SB</span>
          </div>
          <span className="text-xl font-bold text-gray-900">SkillBridge</span>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-8 py-24 text-center">
        <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          Powered by Groq AI + LLaMA 3.3
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Upload Resume.<br />
          <span className="text-indigo-600">Get Hired Faster.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          AI analyzes your resume, finds skill gaps, and tells you exactly what to learn
          to get hired at Google, Microsoft, Amazon and more.
        </p>
        <button
          onClick={handleGoogleLogin}
          className="inline-flex items-center gap-3 bg-white border-2 border-gray-200 px-8 py-4 rounded-xl text-gray-700 font-semibold text-lg hover:border-indigo-400 hover:shadow-md transition"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6 mt-20">
          {[
            { icon: '📄', title: 'Resume Parser', desc: 'AI extracts your skills, experience and education automatically' },
            { icon: '🎯', title: 'Skill Gap Analysis', desc: 'See exactly what skills you need for your dream company' },
            { icon: '📊', title: 'LeetCode Topics', desc: 'Know which DSA topics to practice for specific companies' }
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}