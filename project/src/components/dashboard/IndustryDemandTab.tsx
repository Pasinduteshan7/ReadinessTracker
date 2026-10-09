import { useEffect, useState, type FC } from 'react';
import { AlertCircle, Briefcase, CheckCircle2, Loader2 } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IndustryDemandTabProps {}

interface IndustryDemandResult {
  studentId: number;
  industryMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export const IndustryDemandTab: FC<IndustryDemandTabProps> = () => {
  const [result, setResult] = useState<IndustryDemandResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadIndustryDemand = async () => {
      setLoading(true);
      setError(null);

      try {
        const userJson = localStorage.getItem('user');
        if (!userJson) {
          throw new Error('Your student profile could not be found. Please sign in again.');
        }

        let user: { id?: number | string; token?: string };
        try {
          user = JSON.parse(userJson) as { id?: number | string; token?: string };
        } catch {
          throw new Error('Your saved student profile is invalid. Please sign in again.');
        }

        const studentId = user.id;
        const token = user.token || localStorage.getItem('token');
        if (studentId === undefined || studentId === null || String(studentId).trim() === '') {
          throw new Error('Your student ID is missing. Please sign in again.');
        }
        if (!token) {
          throw new Error('Your authentication token is missing. Please sign in again.');
        }

        const response = await fetch(
          `http://localhost:8080/api/industry-demand/${encodeURIComponent(String(studentId))}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          let message = `Unable to load industry demand data (HTTP ${response.status}).`;
          try {
            const body = await response.json() as { message?: string; error?: string };
            message = body.message || body.error || message;
          } catch {
            // Keep the status-based message when the response has no JSON body.
          }
          throw new Error(message);
        }

        const data = await response.json() as IndustryDemandResult;
        setResult(data);
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === 'AbortError') return;
        setError(loadError instanceof Error
          ? loadError.message
          : 'An unexpected error occurred while loading industry demand data.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadIndustryDemand();
    return () => controller.abort();
  }, []);

  const score = result?.industryMatchScore ?? 0;
  const boundedScore = Math.max(0, Math.min(100, score));
  const scoreLabel = Number.isFinite(score) ? `${score.toFixed(1)}%` : '—';
  const progressOffset = 251.2 * (1 - boundedScore / 100);

  return (
    <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center gap-3 mb-8">
        <Briefcase className="w-8 h-8 text-slate-900" aria-hidden="true" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Industry Demand Analysis</h2>
          <p className="text-sm text-slate-600 mt-1">See how your skills align with industry demand.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-600" role="status">
          <Loader2 className="w-9 h-9 animate-spin text-blue-600 mb-3" aria-hidden="true" />
          <p>Loading your industry demand analysis…</p>
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Could not load industry demand data</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      ) : result ? (
        <>
          <div className="mb-8 flex flex-col items-center rounded-lg border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:justify-center sm:gap-8">
            <div className="relative h-36 w-36 shrink-0" aria-label={`Industry match score: ${scoreLabel}`}>
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" role="img" aria-hidden="true">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="9" className="text-slate-200" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={progressOffset}
                  className="text-emerald-500 transition-[stroke-dashoffset] duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">{scoreLabel}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Match</span>
              </div>
            </div>
            <div className="mt-4 text-center sm:mt-0 sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Industry Match Score</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Your skills match {scoreLabel} of industry demand</p>
              <p className="mt-1 text-sm text-slate-600">Build the missing skills below to improve your alignment.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section aria-labelledby="matched-skills-heading">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-700" aria-hidden="true" />
                <h3 id="matched-skills-heading" className="font-semibold text-slate-900">Matched Skills</h3>
              </div>
              {result.matchedSkills.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {result.matchedSkills.map((skill) => (
                    <li key={skill} className="rounded-full border border-green-200 bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">No industry skills matched your profile yet.</p>
              )}
            </section>

            <section aria-labelledby="missing-skills-heading">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-700" aria-hidden="true" />
                <h3 id="missing-skills-heading" className="font-semibold text-slate-900">Missing Skills · Skill Gap</h3>
              </div>
              {result.missingSkills.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {result.missingSkills.map((skill) => (
                    <li key={skill} className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800">
                      {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Great work — no skill gaps were found.</p>
              )}
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
};
