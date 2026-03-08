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

interface AllStudentsTabProps {
  allStudents: Student[];
}

export function AllStudentsTab({ allStudents }: AllStudentsTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">All Students</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Registration #</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Year</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">GPA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {allStudents.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-900">{student.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{student.email}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{student.registrationNumber}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{student.currentYear}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{student.currentGpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
