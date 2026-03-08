import React, { useState, useEffect } from 'react';

interface SuspiciousSubmission {
  id: string;
  userId: string;
  challengeId: string;
  username: string;
  submittedAt: string;
  pasteAttempts: number;
  tabSwitches: number;
  typingFlags: string[];
  suspiciousLevel: string;
}

export const AdminCheatingDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<SuspiciousSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SuspiciousSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadSuspiciousSubmissions();
  }, []);

  const loadSuspiciousSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/cheating/pending-review');
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuspiciousColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 font-bold';
      case 'high': return 'text-orange-600 font-bold';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const submitReview = async (verdict: 'clean' | 'suspicious' | 'confirmed_cheating') => {
    if (!selectedSubmission) return;

    try {
      const response = await fetch(`/api/admin/cheating/review/${selectedSubmission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verdict,
          notes: reviewNotes
        })
      });

      if (response.ok) {
        setSelectedSubmission(null);
        setReviewNotes('');
        loadSuspiciousSubmissions();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading suspicious submissions...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Anti-Cheat Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Pending Review ({submissions.length})</h2>

            {submissions.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No suspicious submissions</div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className={`p-4 rounded cursor-pointer transition ${
                      selectedSubmission?.id === sub.id ? 'bg-gray-700 border-l-4 border-blue-500' : 'bg-gray-750 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-white">{sub.username}</p>
                        <p className="text-sm text-gray-400">{sub.submittedAt}</p>
                      </div>
                      <span className={`text-sm font-bold uppercase ${getSuspiciousColor(sub.suspiciousLevel)}`}>
                        {sub.suspiciousLevel}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-300">
                      <span>Paste: {sub.pasteAttempts}</span>
                      <span>Tab Switches: {sub.tabSwitches}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedSubmission && (
            <div className="lg:col-span-1 bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Review Submission</h2>

              <div className="space-y-4 text-gray-300 mb-6">
                <div>
                  <p className="text-sm font-bold text-white">Username</p>
                  <p>{selectedSubmission.username}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Suspicious Level</p>
                  <p className={getSuspiciousColor(selectedSubmission.suspiciousLevel)}>
                    {selectedSubmission.suspiciousLevel}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Flags</p>
                  <div className="space-y-1">
                    <p>Paste Attempts: {selectedSubmission.pasteAttempts}</p>
                    <p>Tab Switches: {selectedSubmission.tabSwitches}</p>
                  </div>
                </div>
              </div>

              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add review notes..."
                className="w-full bg-gray-900 text-white p-3 rounded mb-4 border border-gray-700 text-sm"
                rows={4}
              />

              <div className="space-y-2">
                <button
                  onClick={() => submitReview('clean')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm"
                >
                  ✓ Mark as Clean
                </button>
                <button
                  onClick={() => submitReview('suspicious')}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-bold text-sm"
                >
                  ⚠️ Suspicious
                </button>
                <button
                  onClick={() => submitReview('confirmed_cheating')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold text-sm"
                >
                  ✗ Confirmed Cheating
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCheatingDashboard;
