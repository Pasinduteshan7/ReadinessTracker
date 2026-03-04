import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, Shield, BookOpen, Code, Trophy } from 'lucide-react';
interface UserScores {
  userId: number;
  username: string;
  rank: number;
  percentile: number;
  scores: {
    final_score: number;
    codellama_7b_quality: number;
    qwen_3b_quality: number;
    documentation: number;
    security: number;
    maintainability: number;
  };
  calculated_at: string;
}
interface LeaderboardEntry {
  rank: number;
  username: string;
  final_score: number;
  percentage: string;
  codellama_quality: number;
  qwen_quality: number;
  percentile: number;
}
export function ScoresDisplay({ userId }: { userId: number }) {
  const [userScores, setUserScores] = useState<UserScores | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    loadScores();
  }, [userId]);
  const loadScores = async () => {
    try {
      setLoading(true);
      setError('');

      const scoresResponse = await fetch(`http://localhost:8080/api/scores/user/${userId}`);
      if (scoresResponse.ok) {
        const scores = await scoresResponse.json();
        setUserScores(scores);
      }

      const leaderboardResponse = await fetch('http://localhost:8080/api/scores/leaderboard');
      if (leaderboardResponse.ok) {
        const lb = await leaderboardResponse.json();
        setLeaderboard(lb.leaderboard || []);
      }
    } catch (err) {
      setError(`Failed to load scores: ${err}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="text-center py-8">Loading scores...</div>;
  }
  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }
  return (
    <div className="space-y-8">
      {}
      {userScores && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              Your Analysis Results
            </h2>
            <span className="text-sm text-gray-600">
              Updated: {new Date(userScores.calculated_at).toLocaleDateString()}
            </span>
          </div>
          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {}
            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Final Score</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">
                    {(userScores.scores.final_score * 100).toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-500" />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Rank: <span className="font-bold text-gray-800">#{userScores.rank}</span>
              </div>
              <div className="text-sm text-gray-600">
                Percentile: <span className="font-bold text-gray-800">{userScores.percentile?.toFixed(1)}%</span>
              </div>
            </div>
            {}
            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">CodeLlama:7b</p>
                  <p className="text-4xl font-bold text-purple-600 mt-2">
                    {(userScores.scores.codellama_7b_quality * 100).toFixed(1)}%
                  </p>
                </div>
                <Code className="w-10 h-10 text-purple-500" />
              </div>
              <p className="text-xs text-gray-600 mt-3">Deep code quality analysis</p>
            </div>
            {}
            <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Qwen:3b</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">
                    {(userScores.scores.qwen_3b_quality * 100).toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-xs text-gray-600 mt-3">Secondary quality analysis</p>
            </div>
          </div>
          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-gray-700">Documentation</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${(userScores.scores.documentation * 100).toFixed(0)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {(userScores.scores.documentation * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-red-500" />
                <span className="text-sm font-semibold text-gray-700">Security</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${(userScores.scores.security * 100).toFixed(0)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {(userScores.scores.security * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">Maintainability</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(userScores.scores.maintainability * 100).toFixed(0)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {(userScores.scores.maintainability * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          {}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Score Breakdown:</span> Your final score is calculated using a neural network formula that combines:
            </p>
            <ul className="text-sm text-gray-700 mt-2 space-y-1 ml-4">
              <li>✓ CodeLlama:7b analysis (35% weight) - Deep code quality</li>
              <li>✓ Qwen:3b analysis (25% weight) - Secondary quality metrics</li>
              <li>✓ Security concerns (5% weight) - Vulnerability assessment</li>
              <li>✓ Documentation (8% weight) - Code clarity & docs</li>
              <li>✓ AI detection penalty (25% weight) - Authenticity check</li>
            </ul>
          </div>
        </div>
      )}
      {}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Global Leaderboard
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Username</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Final Score</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">CodeLlama</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Qwen</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Percentile</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr
                  key={index}
                  className={`border-b ${
                    entry.username === userScores?.username
                      ? 'bg-blue-50 font-semibold'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        entry.rank === 1
                          ? 'bg-yellow-400 text-white'
                          : entry.rank === 2
                          ? 'bg-gray-400 text-white'
                          : entry.rank === 3
                          ? 'bg-orange-400 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800">{entry.username}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-blue-600">{entry.percentage}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    {(entry.codellama_quality * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    {(entry.qwen_quality * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-600">
                    {entry.percentile?.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-600">No scores available yet</div>
        )}
      </div>
    </div>
  );
}
