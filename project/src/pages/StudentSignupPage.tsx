import { useState } from 'react';
import { studentApi } from '../lib/backend-api';
interface StudentFormData {
  name: string;
  registrationNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  currentYear: string;
  currentGpa: string;
  githubUsername: string;
  linkedinUrl: string;
  facebookUrl: string;
}
export function StudentSignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    registrationNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    currentYear: '1st Year',
    currentGpa: '',
    githubUsername: '',
    linkedinUrl: '',
    facebookUrl: '',
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await studentApi.register({
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        email: formData.email,
        password: formData.password,
        currentYear: formData.currentYear,
        currentGpa: formData.currentGpa ? parseFloat(formData.currentGpa) : 0,
        githubUsername: formData.githubUsername || '',
        linkedinUrl: formData.linkedinUrl || '',
        facebookUrl: formData.facebookUrl || '',
      });
      setSuccess(true);
      setFormData({
        name: '',
        registrationNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        currentYear: '1st Year',
        currentGpa: '',
        githubUsername: '',
        linkedinUrl: '',
        facebookUrl: '',
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow">
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Student Registration</h2>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              Registration successful! Redirecting to login...
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {}
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {}
            <div>
              <label className="block text-sm font-medium mb-1">Registration Number *</label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="CE/2024/001"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {}
            <div>
              <label className="block text-sm font-medium mb-1">University Email *</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {}
            <div>
              <label className="block text-sm font-medium mb-1">Current Year *</label>
              <select
                name="currentYear"
                value={formData.currentYear}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
            {}
            <div>
              <label className="block text-sm font-medium mb-1">Current GPA (Optional)</label>
              <input
                type="number"
                name="currentGpa"
                value={formData.currentGpa}
                onChange={handleChange}
                placeholder="3.50"
                step="0.01"
                min="0"
                max="4"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">GitHub Username</label>
                <input
                  type="text"
                  name="githubUsername"
                  value={formData.githubUsername}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {}
            <div>
              <label className="block text-sm font-medium mb-1">Facebook URL</label>
              <input
                type="text"
                name="facebookUrl"
                value={formData.facebookUrl}
                onChange={handleChange}
                placeholder="facebook.com/..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Student Account'}
            </button>
          </form>
          <p className="text-center text-sm mt-4">
            Already have an account? <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
}
