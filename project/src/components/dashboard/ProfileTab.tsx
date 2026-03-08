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

interface ProfileTabProps {
  currentUser: Student | null;
}

export function ProfileTab({ currentUser }: ProfileTabProps) {
  if (!currentUser) {
    return <div className="text-slate-600">Loading profile...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h2>
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
      </div>
    </div>
  );
}
