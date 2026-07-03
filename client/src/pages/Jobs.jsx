import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get('/jobs')
      .then(res => { setJobs(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const types = ['All', 'Full-time', 'Internship', 'Remote'];
  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.type === filter || j.location === filter);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">💼 Job Matches</h1>
          <p className="text-gray-500">Jobs matched based on your skills</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === t
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((job, i) => (
              <div key={i} className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-violet-500/30 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                    <p className="text-violet-400 font-medium">{job.company}</p>
                  </div>
                  <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-1 rounded-full">
                    {job.type}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>📍 {job.location}</span>
                  {job.salary && <span>💰 {job.salary}</span>}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.required_skills?.slice(0, 5).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-white/5 text-gray-400 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>

                <p className="text-gray-500 text-sm mb-4">{job.description}</p>

                <button className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition">
                  Apply Now →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}