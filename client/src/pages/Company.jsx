import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';

const COMPANIES = {
  google: {
    name: 'Google',
    logo: '🔵',
    color: 'from-blue-500/10 to-green-500/10 border-blue-500/20',
    package: '25-45 LPA',
    location: 'Bangalore, Hyderabad',
    process: ['Online Assessment', 'Phone Screen', '4-5 Tech Rounds', 'Hiring Committee', 'Offer'],
    skills: ['DSA', 'System Design', 'Python/Go', 'Distributed Systems', 'OS Concepts'],
    leetcode: ['Arrays', 'Trees', 'Graphs', 'Dynamic Programming', 'String Manipulation'],
    culture: 'Focus on scalability, clean code, and data-driven decisions.',
    tips: [
      'Practice 200+ LeetCode problems',
      'Focus on time/space complexity',
      'Learn system design basics',
      'Study Google-specific products',
      'Behavioral: STAR method'
    ]
  },
  microsoft: {
    name: 'Microsoft',
    logo: '🪟',
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
    package: '20-40 LPA',
    location: 'Hyderabad, Noida',
    process: ['Online Test', 'Technical Phone Screen', '4 Onsite Rounds', 'Offer'],
    skills: ['C++/C#', 'Azure', 'System Design', 'OOP', 'Data Structures'],
    leetcode: ['Binary Search', 'Linked Lists', 'Trees', 'Recursion', 'DP'],
    culture: 'Growth mindset, collaboration, and customer obsession.',
    tips: [
      'Strong OOP concepts required',
      'Azure cloud knowledge helps',
      'Focus on problem-solving approach',
      'Practice coding on whiteboard',
      'Research Microsoft products'
    ]
  },
  amazon: {
    name: 'Amazon',
    logo: '📦',
    color: 'from-orange-500/10 to-yellow-500/10 border-orange-500/20',
    package: '18-35 LPA',
    location: 'Bangalore, Hyderabad, Chennai',
    process: ['Online Assessment', '2 Phone Screens', '5-6 Onsite Loops', 'Bar Raiser', 'Offer'],
    skills: ['Java', 'AWS', 'Microservices', 'System Design', 'Leadership Principles'],
    leetcode: ['Arrays', 'Hash Maps', 'Trees', 'Sorting', 'Two Pointers'],
    culture: '16 Leadership Principles — customer obsession is #1.',
    tips: [
      'Master all 16 Leadership Principles',
      'Prepare STAR stories for each principle',
      'Bar Raiser round is critical',
      'Know AWS services',
      'Practice system design at scale'
    ]
  },
  flipkart: {
    name: 'Flipkart',
    logo: '🛒',
    color: 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20',
    package: '15-28 LPA',
    location: 'Bangalore',
    process: ['Online Test', '2-3 Tech Rounds', 'Culture Fit', 'Offer'],
    skills: ['Java', 'React', 'System Design', 'MySQL', 'Redis'],
    leetcode: ['Arrays', 'Strings', 'Trees', 'Graphs', 'Greedy'],
    culture: 'Startup mindset with scale — move fast, own your work.',
    tips: [
      'E-commerce domain knowledge helps',
      'Focus on scalable architecture',
      'Practice medium-hard LeetCode',
      'Know caching strategies',
      'Study supply chain tech'
    ]
  }
};

export default function Company() {
  const { name } = useParams();
  const navigate = useNavigate();
  const company = COMPANIES[name?.toLowerCase()] || COMPANIES.google;
  const [activeTab, setActiveTab] = useState('overview');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const getFeedback = async () => {
    if (!answer.trim()) { toast.error('Write your answer first!'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/chat/interview-feedback', {
        question, answer, company: company.name
      });
      setFeedback(data.feedback);
    } catch {
      toast.error('Failed to get feedback');
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['overview', 'interview', 'leetcode', 'tips'];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* Header */}
        <div className={`bg-gradient-to-r ${company.color} border rounded-2xl p-6 mb-6`}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{company.logo}</span>
            <div>
              <h1 className="text-3xl font-bold text-white">{company.name}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                <span>📍 {company.location}</span>
                <span>💰 {company.package}</span>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-sm">{company.culture}</p>
        </div>

        {/* Company Switcher */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.keys(COMPANIES).map(c => (
            <button
              key={c}
              onClick={() => navigate('/company/' + c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                name?.toLowerCase() === c
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {COMPANIES[c].logo} {COMPANIES[c].name}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/3 border border-white/8 rounded-xl p-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition capitalize ${
                activeTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">📋 Interview Process</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {company.process.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-violet-500/10 border border-violet-500/20 text-violet-400 px-3 py-1.5 rounded-xl text-sm">
                      {i + 1}. {step}
                    </div>
                    {i < company.process.length - 1 && (
                      <span className="text-gray-600">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">🛠️ Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {company.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Interview Tab */}
        {activeTab === 'interview' && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white">🎯 Practice Interview</h3>
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1.5 block">Your Question</label>
              <input
                type="text"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder={'e.g. Design ' + company.name + ' search system'}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase mb-1.5 block">Your Answer</label>
              <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Write your answer here..."
                rows={5}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition text-sm resize-none"
              />
            </div>
            <button
              onClick={getFeedback}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl transition disabled:opacity-40"
            >
              {loading ? 'Getting feedback...' : '🤖 Get AI Feedback'}
            </button>
            {feedback && (
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <p className="text-xs text-green-400 font-medium uppercase mb-2">AI Feedback</p>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{feedback}</p>
              </div>
            )}
          </div>
        )}

        {/* LeetCode Tab */}
        {activeTab === 'leetcode' && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">📊 LeetCode Topics for {company.name}</h3>
            <div className="space-y-3">
              {company.leetcode.map((topic, i) => (
                <div key={topic} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl">
                  <span className="w-7 h-7 bg-violet-500/20 text-violet-400 rounded-lg flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-gray-200 font-medium">{topic}</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    i < 2 ? 'bg-red-500/10 text-red-400' :
                    i < 4 ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-green-500/10 text-green-400'
                  }`}>
                    {i < 2 ? 'High Priority' : i < 4 ? 'Medium' : 'Good to know'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">💡 Pro Tips for {company.name}</h3>
            <div className="space-y-3">
              {company.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white/3 rounded-xl">
                  <span className="text-violet-400 mt-0.5">✓</span>
                  <span className="text-gray-300 text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}