import { useState, useEffect } from 'react';
import { Play, Settings, RotateCw } from 'lucide-react';

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

interface BatchProgressCardProps {
  batch: BatchConfig;
  onStartAnalysis: (batchYear: number) => Promise<void>;
  onUpdate: (batchYear: number) => void;
}

export function BatchProgressCard({ batch, onStartAnalysis, onUpdate }: BatchProgressCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartAnalysis = async () => {
    try {
      setIsLoading(true);
      setError('');
      await onStartAnalysis(batch.batchYear);
      setTimeout(onUpdate, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to start analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const progressValue = parseFloat(batch.progressPercentage);
  const getStatusColor = () => {
    switch (batch.status) {
      case 'COMPLETE':
        return 'bg-green-100 text-green-800';
      case 'ANALYZING':
        return 'bg-blue-100 text-blue-800';
      case 'READY':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (batch.status) {
      case 'COMPLETE':
        return '✓ Complete';
      case 'ANALYZING':
        return '⟳ Analyzing';
      case 'READY':
        return '★ Ready';
      case 'PENDING':
        return '○ Pending';
      default:
        return batch.status;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Year {batch.batchYear} Batch
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
          {getStatusLabel()}
        </span>
      </div>

      <div className="space-y-4">
        {/* Registration Progress */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="text-sm text-gray-600 font-medium">
              Registration Progress
            </label>
            <span className="text-sm font-bold text-gray-900">
              {batch.registeredStudents}/{batch.targetStudents} ({batch.progressPercentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                batch.isFull
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}
              style={{ width: `${Math.min(progressValue, 100)}%` }}
            />
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs text-gray-600">Auto-Start</p>
            <p className="font-semibold text-gray-900">
              {batch.autoStartEnabled ? '✓ Enabled' : '✗ Disabled'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Delay</p>
            <p className="font-semibold text-gray-900">
              {batch.delayBeforeStartHours === 0
                ? 'Immediate'
                : `${batch.delayBeforeStartHours}h`}
            </p>
          </div>
        </div>

        {/* Analysis Timing */}
        {batch.analysisStartedAt && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Analysis Timeline</p>
            <p className="text-xs text-gray-700">
              Started: {new Date(batch.analysisStartedAt).toLocaleString()}
            </p>
            {batch.analysisCompletedAt && (
              <p className="text-xs text-gray-700">
                Completed: {new Date(batch.analysisCompletedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {batch.status === 'READY' && (
            <button
              onClick={handleStartAnalysis}
              disabled={isLoading || batch.status === 'ANALYZING'}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              {isLoading ? 'Starting...' : 'Start Analysis'}
            </button>
          )}
          {batch.status === 'ANALYZING' && (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              <RotateCw className="w-4 h-4 animate-spin" />
              Analysis Running
            </button>
          )}
          {batch.status !== 'ANALYZING' && batch.status !== 'COMPLETE' && (
            <button
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              disabled
            >
              <Settings className="w-4 h-4" />
              Configure
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
