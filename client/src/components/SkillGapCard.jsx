export default function SkillGapCard({ analysis, company }) {
  const score = analysis.match_score || 0;
  const color = score >= 70 ? 'green' : score >= 50 ? 'yellow' : 'red';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-900">{company}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium
          ${color === 'green' ? 'bg-green-50 text-green-700' :
            color === 'yellow' ? 'bg-yellow-50 text-yellow-700' :
            'bg-red-50 text-red-700'}`}>
          {score}% match
        </span>
      </div>

      {/* Match bar */}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color === 'green' ? 'bg-green-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">Strong matches</p>
          {analysis.strong_matches?.slice(0, 3).map(s => (
            <div key={s} className="flex items-center gap-1.5 text-sm text-green-700 mb-1">
              <span>✅</span> {s}
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">Missing skills</p>
          {analysis.missing_skills?.slice(0, 3).map(s => (
            <div key={s} className="flex items-center gap-1.5 text-sm text-red-600 mb-1">
              <span>❌</span> {s}
            </div>
          ))}
        </div>
      </div>

      {analysis.leetcode_topics?.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">LeetCode Topics</p>
          <div className="flex flex-wrap gap-1.5">
            {analysis.leetcode_topics.map(t => (
              <span key={t} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 pt-1">
        Hiring probability: <span className="font-medium text-gray-700">{analysis.hiring_probability}</span>
      </div>
    </div>
  );
}