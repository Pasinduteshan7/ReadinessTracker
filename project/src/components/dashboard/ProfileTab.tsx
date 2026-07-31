import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { studentApi } from '../../lib/backend-api';

interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber: string;
  currentYear: string;
  currentGpa: number;
  githubUsername?: string;
  linkedinUrl?: string;
  createdAt: number;
}

interface ProfileTabProps {
  currentUser: Student | null;
}

export function ProfileTab({ currentUser }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<Student>>(
    currentUser ? {
      githubUsername: currentUser.githubUsername || '',
      linkedinUrl: currentUser.linkedinUrl || '',
      currentYear: currentUser.currentYear || '',
      currentGpa: currentUser.currentGpa || 0,
    } : {}
  );

  if (!currentUser) {
    return <div className="text-slate-600">Loading profile...</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'currentGpa' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await studentApi.updateStudent(currentUser.id, formData);
      
      // Update localStorage with new data
      localStorage.setItem('user', JSON.stringify(response.token ? response : response));
      
      // Update parent state by reloading
      window.location.reload();
      
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      githubUsername: currentUser.githubUsername || '',
      linkedinUrl: currentUser.linkedinUrl || '',
      currentYear: currentUser.currentYear || '',
      currentGpa: currentUser.currentGpa || 0,
    });
    setError('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : null}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!isEditing ? (
        // Read-only view
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-slate-600">Name</label>
            <p className="text-lg font-semibold text-slate-900">{currentUser.name}</p>
          </div>
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <p className="text-lg font-semibold text-slate-900">{currentUser.email}</p>
          </div>
          <div>
            <label className="text-sm text-slate-600">Registration Number</label>
            <p className="text-lg font-semibold text-slate-900">{currentUser.registrationNumber || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm text-slate-600">Current Year</label>
            <p className="text-lg font-semibold text-slate-900">{currentUser.currentYear}</p>
          </div>
          <div>
            <label className="text-sm text-slate-600">GPA</label>
            <p className="text-lg font-semibold text-slate-900">{currentUser.currentGpa}</p>
          </div>
          <div>
            <label className="text-sm text-slate-600">GitHub</label>
            <p className="text-lg font-semibold text-slate-900">{currentUser.githubUsername || 'Not provided'}</p>
          </div>
          <div>
            <label className="text-sm text-slate-600">LinkedIn</label>
            <p className="text-lg font-semibold text-slate-900">{currentUser.linkedinUrl || 'Not provided'}</p>
          </div>
        </div>
      ) : (
        // Editable view
        <form className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Year</label>
              <select
                name="currentYear"
                value={formData.currentYear}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GPA</label>
              <input
                type="number"
                name="currentGpa"
                value={formData.currentGpa}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                max="4.0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GitHub Username</label>
              <input
                type="text"
                name="githubUsername"
                value={formData.githubUsername || ''}
                onChange={handleInputChange}
                placeholder="e.g., octocat"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl || ''}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
