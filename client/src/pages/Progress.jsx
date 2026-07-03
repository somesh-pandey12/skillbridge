import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';

export default function Progress() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/resume')
      .then(res => { setResumes(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getScore = (resume) => {
    const skillScore = Math.min((resume.parsedSkills?.length || 0) * 3, 40);
    const expScore = resume.experience?.length > 0 ? 30 : 10;
    const eduScore = resume.education?.length > 0 ? 20 : 5;
    return Math.min(skillScore + expScore + eduScore + 10, 100);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📈 Progress Tracker</h1>
          <p className="text-gray-500">Track your skill improvement over time</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : resumes.length === 0 ? (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-12 text-center">
            <span className="text-5xl block mb-4">📊</span>
            <p className="text-gray-400 font-medium">No resume history yet</p>
            <p className="text-gray-600 text-sm mt-1">Upload your resume to start tracking progress</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume, i) => {
              const score = getScore(resume);
              return (
                <div key={resume._id} className="bg-white/3 border border-white/8 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-medium">Resume #{resumes.length - i}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {new Date(resume.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className={`text-2xl font-bold ${score >= 70 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {score}/100
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="w-full bg-white/5 rounded-full h-2 mb-4">
                    <div
                      className={`h-2 rounded-full transition-all ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {resume.parsedSkills?.slice(0, 8).map(skill => (
                      <span key={skill} className="px-2 py-0.5 bg-violet-500/10 text-violet-400 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                    {resume.parsedSkills?.length > 8 && (
                      <span className="px-2 py-0.5 bg-white/5 text-gray-500 text-xs rounded-full">
                        +{resume.parsedSkills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}