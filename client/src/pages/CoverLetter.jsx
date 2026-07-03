import { useState } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function CoverLetter() {
  const [form, setForm] = useState({ company: '', role: '', skills: '', experience: '' });
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!form.company || !form.role) { toast.error('Company aur role required hai!'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/chat/cover-letter', form);
      setLetter(data.letter);
      toast.success('Cover letter generated!');
    } catch {
      toast.error('Generation failed. Try again!');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(letter);
    toast.success('Copied to clipboard!');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">✉️ Cover Letter Generator</h1>
          <p className="text-gray-500">AI-powered personalized cover letters in seconds</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white mb-2">Job Details</h2>
            {[
              { key: 'company', label: 'Company Name', placeholder: 'e.g. Google' },
              { key: 'role', label: 'Job Role', placeholder: 'e.g. Software Engineer' },
              { key: 'skills', label: 'Your Top Skills', placeholder: 'e.g. React, Node.js, Python' },
              { key: 'experience', label: 'Brief Experience', placeholder: 'e.g. 1 year internship at startup' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs text-gray-500 uppercase mb-1.5 block">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm({...form, [field.key]: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 transition text-sm"
                />
              </div>
            ))}

            <button onClick={generate} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl transition disabled:opacity-40">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                  Generating...
                </span>
              ) : 'Generate Cover Letter →'}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Generated Letter</h2>
              {letter && (
                <button onClick={copyToClipboard}
                  className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full hover:bg-violet-500/20 transition">
                  Copy
                </button>
              )}
            </div>

            {letter ? (
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                {letter}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                <span className="text-4xl mb-3">✉️</span>
                <p className="text-sm">Fill the form and click generate</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}