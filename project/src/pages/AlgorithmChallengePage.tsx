import React, { useState, useEffect } from 'react';
import SecureCodeEditor from '../components/SecureCodeEditor';

interface Challenge {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  example_input: string;
  example_output: string;
  constraints: string;
  max_score: number;
  time_limit_minutes: number;
  expected_time_complexity?: string;
  expected_space_complexity?: string;
}

interface AlgorithmChallengePageProps {
  userId: string;
  difficulty: string;
}

export const AlgorithmChallengePage: React.FC<AlgorithmChallengePageProps> = ({
  userId,
  difficulty
}) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [showAgreement, setShowAgreement] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!showAgreement) {
      assignChallenge();
    }
  }, [showAgreement]);

  const assignChallenge = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/challenge/assign?userId=${userId}&difficulty=${difficulty}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        setChallenge({
          id: data.challenge_id,
          title: data.title,
          difficulty: data.difficulty,
          description: data.description,
          example_input: data.example_input,
          example_output: data.example_output,
          constraints: data.constraints,
          max_score: data.max_score,
          time_limit_minutes: data.time_limit_minutes,
          expected_time_complexity: data.time_complexity || 'N/A',
          expected_space_complexity: data.space_complexity || 'N/A'
        });

        const subResponse = await fetch(`http://localhost:8080/api/challenge/submit?userId=${userId}&challengeId=${data.challenge_id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: '',
            language: 'python',
            time_taken_seconds: 0
          })
        });

        const subData = await subResponse.json();
        if (subData.success) {
          setSubmissionId(subData.submission_id);
        }
      }
    } catch (err) {
      setError('Failed to load challenge: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (_code: string, _metadata: any) => {
    setWarning('Solution submitted for evaluation...');
  };

  if (showAgreement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">⚠️ Algorithm Challenge Rules</h2>

          <div className="space-y-6 text-gray-300 mb-8">
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-3">✅ Allowed:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Typing your own code</li>
                <li>Using language documentation</li>
                <li>Thinking and planning on paper</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-red-400 mb-3">❌ NOT Allowed:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Copy-pasting code</li>
                <li>Using ChatGPT, Copilot, or AI assistants</li>
                <li>Searching for solutions online</li>
                <li>Getting help from others</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold text-yellow-400 mb-3">🔍 Monitoring:</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Paste actions are blocked and logged</li>
                <li>Typing speed is analyzed</li>
                <li>Tab switches are tracked</li>
                <li>Code is checked for plagiarism</li>
                <li>Suspicious activity triggers manual review</li>
              </ul>
            </div>

            <div className="bg-red-900 border border-red-700 rounded p-4">
              <p className="font-bold text-red-300 mb-2">⚠️ VIOLATION = DISQUALIFICATION</p>
              <p className="text-red-200">Cheating will result in automatic score of 0 and removal from leaderboard.</p>
            </div>
          </div>

          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5"
            />
            <span className="text-white font-bold">I understand and agree to follow these rules</span>
          </label>

          <button
            onClick={() => setShowAgreement(false)}
            disabled={!agreedToTerms}
            className={`w-full py-3 rounded font-bold text-white transition ${
              agreedToTerms
                ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            Start Challenge
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="text-white text-center py-20">Loading challenge...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-20">{error}</div>;
  }

  if (!challenge || !submissionId) {
    return <div className="text-white text-center py-20">Failed to load challenge</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {warning && (
              <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded mb-4">
                {warning}
              </div>
            )}
            <SecureCodeEditor
              submissionId={submissionId}
              challengeId={challenge.id}
              language="python"
              onSubmit={handleSubmit}
              onWarning={setWarning}
            />
          </div>

          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-6 h-fit">
            <h2 className="text-2xl font-bold text-white mb-4">{challenge.title}</h2>
            
            <div className="mb-4">
              <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold uppercase">
                {challenge.difficulty}
              </span>
              <span className="ml-2 text-gray-400 text-sm">Max Score: {challenge.max_score}</span>
            </div>

            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="font-bold text-white mb-2">Description</h3>
                <p className="text-sm">{challenge.description}</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">Example</h3>
                <div className="bg-gray-900 p-3 rounded text-sm font-mono">
                  <div><span className="text-blue-400">Input:</span> {challenge.example_input}</div>
                  <div><span className="text-green-400">Output:</span> {challenge.example_output}</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white mb-2">Constraints</h3>
                <p className="text-sm">{challenge.constraints}</p>
              </div>

              {challenge.expected_time_complexity && (
                <div>
                  <h3 className="font-bold text-white mb-2">Expected Complexity</h3>
                  <p className="text-sm">Time: {challenge.expected_time_complexity}</p>
                  <p className="text-sm">Space: {challenge.expected_space_complexity}</p>
                </div>
              )}

              <div className="border-t border-gray-700 pt-4 mt-4">
                <p className="text-xs text-gray-500">
                  Time Limit: {challenge.time_limit_minutes} minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmChallengePage;
