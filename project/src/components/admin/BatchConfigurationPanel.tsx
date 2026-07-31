import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, Plus } from 'lucide-react';
import { BatchProgressCard } from './BatchProgressCard';
import { BatchConfigModal } from './BatchConfigModal';

interface BatchConfig {
  id: number;
  batchYear: number;
  targetStudents: number;
  registeredStudents: number;
  progressPercentage: string;
  isFull: boolean;
  status: string;
  autoStartEnabled: boolean;
  delayBeforeStartHours: number;
  analysisStartedAt: string | null;
  analysisCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BatchOverviewStats {
  totalBatches: number;
  fullBatches: number;
  analyzingBatches: number;
  completeBatches: number;
  totalStudents: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export function BatchConfigurationPanel() {
  const [batches, setBatches] = useState<BatchConfig[]>([]);
  const [stats, setStats] = useState<BatchOverviewStats>({
    totalBatches: 0,
    fullBatches: 0,
    analyzingBatches: 0,
    completeBatches: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/batch-config/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch batches: ${response.statusText}`);
      }

      const data = await response.json();
      setBatches(data.batches || []);

      // Calculate stats
      const batchList = data.batches || [];
      const fullCount = batchList.filter((b: BatchConfig) => b.isFull).length;
      const analyzingCount = batchList.filter((b: BatchConfig) => b.status === 'ANALYZING').length;
      const completeCount = batchList.filter((b: BatchConfig) => b.status === 'COMPLETE').length;
      const totalStudents = batchList.reduce((acc: number, b: BatchConfig) => acc + b.registeredStudents, 0);

      setStats({
        totalBatches: batchList.length,
        fullBatches: fullCount,
        analyzingBatches: analyzingCount,
        completeBatches: completeCount,
        totalStudents: totalStudents
      });

      setError('');
    } catch (err: any) {
      console.error('Error fetching batches:', err);
      setError(err.message || 'Failed to load batch configurations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBatches();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBatches, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStartAnalysis = async (batchYear: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/admin/batch-config/${batchYear}/start-analysis`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to start analysis: ${response.statusText}`);
      }

      await fetchBatches();
    } catch (err) {
      throw err;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBatches();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
        <p className="text-gray-600">Loading batch configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Batch Management</h2>
          <p className="text-gray-600 text-sm mt-1">
            Monitor and manage automatic batch analysis triggering
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Configure Batch
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-700 font-semibold mb-1">Total Batches</p>
          <p className="text-2xl font-bold text-blue-900">{stats.totalBatches}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <p className="text-xs text-green-700 font-semibold mb-1">Full Batches</p>
          <p className="text-2xl font-bold text-green-900">{stats.fullBatches}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-yellow-700 font-semibold mb-1">Analyzing</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.analyzingBatches}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-purple-700 font-semibold mb-1">Complete</p>
          <p className="text-2xl font-bold text-purple-900">{stats.completeBatches}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-700 font-semibold mb-1">Total Registered</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
        </div>
      </div>

      {/* Batch Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {batches.map(batch => (
          <BatchProgressCard
            key={batch.batchYear}
            batch={batch}
            onStartAnalysis={handleStartAnalysis}
            onUpdate={fetchBatches}
          />
        ))}
      </div>

      {/* Empty State */}
      {batches.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No batch configurations found.</p>
          <p className="text-gray-500 text-sm mt-1">
            Batches will appear here once they are created.
          </p>
        </div>
      )}

      {/* Batch Configuration Modal */}
      <BatchConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSuccess={fetchBatches}
      />
    </div>
  );
}
