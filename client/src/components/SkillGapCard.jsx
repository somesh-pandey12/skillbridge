// client/src/components/SkillGapCard.jsx
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

export default function SkillGapCard({ analysis, company }) {
  const chartData = analysis.recommendations.map(r => ({
    skill: r.skill,
    priority: r.priority === 'high' ? 90 : r.priority === 'medium' ? 60 : 30
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">{company}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium
          ${analysis.match_score >= 70 ? 'bg-green-50 text-green-700' :
            analysis.match_score >= 50 ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'}`}>
          {analysis.match_score}% match
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Strong matches</p>
          {analysis.strong_matches.map(s => (
            <div key={s} className="flex items-center gap-2 text-sm text-green-700 mb-1">
              <CheckCircle2 className="w-4 h-4" /> {s}
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Gaps to fill</p>
          {analysis.missing_skills.map(s => (
            <div key={s} className="flex items-center gap-2 text-sm text-red-600 mb-1">
              <XCircle className="w-4 h-4" /> {s}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase mb-2">
          <TrendingUp className="inline w-3.5 h-3.5 mr-1" />
          LeetCode topics to practice
        </p>
        <div className="flex flex-wrap gap-2">
          {analysis.leetcode_topics.map(t => (
            <span key={t} className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}