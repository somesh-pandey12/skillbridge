import { useState } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';

const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Startups'];
const LEVELS = ['Intern', 'Junior', 'Senior'];

export default function Interview() {
  const [company, setCompany] = useState('Google');
  const [level, setLevel] = useState('Junior');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeQ, setActiveQ] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const generateQuestions = async () => {
    setLoading(true);
    setQuestions([]);
    try {
      const { data } = await api.post('/chat/interview-questions', { company, level });
      setQuestions(data.questions || []);
    } catch {
      toast.error('Failed to generate questions. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const getFeedback = async (question) => {
    if (!answer.trim()) { toast.error('Please write your answer first!'); return; }
    setFeedbackLoading(true);
    setFeedback('');
    try {
      const { data } = await api.post('/chat/interview-feedback', { question, answer, company });
      setFeedback(data.feedback);
    } catch {
      toast.error('Failed to get feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎯 Interview Prep</h1>
          <p className="text-gray-500">AI-generated questions + instant feedback</p>
        </div>

        {/* Config */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500 uppercase mb-2 block">Target Company</label>
              <div className="flex flex-wrap gap-2">
                {COMPANIES.map(c => (
                  <button key={c} onClick={() => setCompany(c)}
                    className={`px-3 py-1.5 rounded-xl text-sm transition ${company === c ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase mb-2 block">Experience Level</label>
              <div className="flex gap-2">
                {LEVELS.map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`px-3 py-1.5 rounded-xl text-sm transition ${level === l ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={generateQuestions} disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl transition disabled:opacity-40">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                Generating questions...
              </span>
            ) : `Generate ${company} Interview Questions →`}
          </button>
        </div>

        {/* Questions */}
        {questions.length > 0 && (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
                <button
                  onClick={() => { setActiveQ(activeQ === i ? null : i); setAnswer(''); setFeedback(''); }}
                  className="w-full px-6 py-4 text-left flex items-center gap-3"
                >
                  <span className="w-7 h-7 bg-violet-500/20 text-violet-400 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-gray-200 text-sm flex-1">{q}</span>
                  <span className="text-gray-600">{activeQ === i ? '▲' : '▼'}</span>
                </button>

                {activeQ === i && (
                  <div className="px-6 pb-6 border-t border-white/5 pt-4 space-y-3">
                    <textarea
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition text-sm resize-none"
                    />
                    <button onClick={() => getFeedback(q)} disabled={feedbackLoading}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition disabled:opacity-40">
                      {feedbackLoading ? 'Getting feedback...' : '🤖 Get AI Feedback'}
                    </button>

                    {feedback && (
                      <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                        <p className="text-xs text-green-400 font-medium mb-2 uppercase">AI Feedback</p>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}