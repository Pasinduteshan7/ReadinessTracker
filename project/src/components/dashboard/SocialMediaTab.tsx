import { MessageSquare, Zap, Facebook } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  registrationNumber: string;
  currentYear: string;
  currentGpa: number;
  githubUsername?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  createdAt: number;
}

interface SocialMediaTabProps {
  currentUser: Student | null;
}

export function SocialMediaTab({ currentUser }: SocialMediaTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-8 h-8 text-slate-900" />
        <h2 className="text-2xl font-bold text-slate-900">Social Media Analysis</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">LinkedIn</h3>
          </div>
          <p className="text-slate-600 text-sm mb-3">
            {currentUser?.linkedinUrl ? 'Connected' : 'Not connected'}
          </p>
          {currentUser?.linkedinUrl && (
            <a
              href={currentUser.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View Profile →
            </a>
          )}
        </div>
        <div className="border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Facebook className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-900">Facebook</h3>
          </div>
          <p className="text-slate-600 text-sm mb-3">
            {currentUser?.facebookUrl ? 'Connected' : 'Not connected'}
          </p>
          {currentUser?.facebookUrl && (
            <a
              href={currentUser.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              View Profile →
            </a>
          )}
        </div>
      </div>
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3">Professional Online Presence</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p>• Profile completeness: <span className="font-semibold text-slate-900">Not calculated yet</span></p>
          <p>• Recommended: Add professional photo, complete bio, and endorsements</p>
        </div>
      </div>
    </div>
  );
}
