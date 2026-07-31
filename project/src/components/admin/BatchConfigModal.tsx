import { useState } from 'react';
import { X } from 'lucide-react';
import { batchService } from '../../services/batchService';

interface BatchConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BatchConfigModal({ isOpen, onClose, onSuccess }: BatchConfigModalProps) {
  const [formData, setFormData] = useState({
    batchYear: 1,
    targetStudentCount: 200,
    autoStartEnabled: true,
    delayBeforeStartHours: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      await batchService.createBatch(
        formData.batchYear,
        formData.targetStudentCount,
        formData.autoStartEnabled,
        formData.delayBeforeStartHours
      );

      onSuccess();
      onClose();
      setFormData({
        batchYear: 1,
        targetStudentCount: 200,
        autoStartEnabled: true,
        delayBeforeStartHours: 0
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create batch configuration');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Configure Batch</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Batch Year */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Batch Year
            </label>
            <select
              name="batchYear"
              value={formData.batchYear}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>Year 1</option>
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
            </select>
          </div>

          {/* Target Student Count */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Target Student Count
            </label>
            <input
              type="number"
              name="targetStudentCount"
              value={formData.targetStudentCount}
              onChange={handleInputChange}
              min="1"
              max="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Analysis will auto-start when this many students are registered
            </p>
          </div>

          {/* Auto-Start */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoStart"
              name="autoStartEnabled"
              checked={formData.autoStartEnabled}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="autoStart" className="text-sm font-medium text-gray-900">
              Enable Auto-Start
            </label>
          </div>

          {/* Delay (only if auto-start enabled) */}
          {formData.autoStartEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Delay Before Start (hours)
              </label>
              <input
                type="number"
                name="delayBeforeStartHours"
                value={formData.delayBeforeStartHours}
                onChange={handleInputChange}
                min="0"
                max="168"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                0 = immediate, 24 = wait 1 day after batch fills
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-xs text-blue-900">
              <strong>How it works:</strong> When the target number of students register in this batch, the system will automatically:
            </p>
            <ul className="text-xs text-blue-900 mt-2 list-disc list-inside space-y-1">
              <li>Mark the batch as READY</li>
              <li>Wait for the configured delay (if any)</li>
              <li>Auto-trigger the full analysis pipeline</li>
              <li>Run analysis in the background</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 disabled:text-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
            >
              {loading ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
