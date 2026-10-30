import { useState, useEffect } from 'react';
import { X, ArrowRight, AlertTriangle, CheckCircle2, RotateCcw, GraduationCap, Users } from 'lucide-react';
import { batchService } from '../../services/batchService';

interface PromoteAcademicYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PreviewStats {
  graduatingCount: number;
  promotingToFourthYear: number;
  promotingToThirdYear: number;
  promotingToSecondYear: number;
  totalActiveUndergrads: number;
}

export function PromoteAcademicYearModal({ isOpen, onClose, onSuccess }: PromoteAcademicYearModalProps) {
  const [preview, setPreview] = useState<PreviewStats | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [newFirstYearTarget, setNewFirstYearTarget] = useState<number>(200);
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadPreview();
      setConfirmText('');
      setError('');
      setSuccessResult(null);
    }
  }, [isOpen]);

  const loadPreview = async () => {
    try {
      setLoadingPreview(true);
      setError('');
      const data = await batchService.getPromotePreview();
      setPreview(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText.trim().toUpperCase() !== 'PROMOTE') {
      setError('Please type PROMOTE to confirm');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await batchService.promoteAcademicYear(newFirstYearTarget);
      setSuccessResult(res);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Academic year promotion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Promote Academic Year</h2>
              <p className="text-xs text-rose-100">Advance student cohorts by +1 year & open Year 1 for new intake</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold">Operation Notice</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {successResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-900">{successResult.message || 'Academic Year Promoted Successfully!'}</p>
                <p className="text-xs text-green-700">Updating dashboard and batch configuration metrics...</p>
              </div>
            </div>
          )}

          {/* Promotion Pipeline Visualization */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-red-600" />
              Batch Advancement Pipeline
            </h3>

            {loadingPreview ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">Calculating student transition preview...</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* 4th Year -> Graduated */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <div>
                      <span className="text-sm font-semibold text-slate-900">4th Year Batch</span>
                      <p className="text-xs text-slate-500">{preview?.graduatingCount || 0} students</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Graduated (Alumni)
                    </span>
                  </div>
                </div>

                {/* 3rd Year -> 4th Year */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <div>
                      <span className="text-sm font-semibold text-slate-900">3rd Year Batch</span>
                      <p className="text-xs text-slate-500">{preview?.promotingToFourthYear || 0} students</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      Promoted to 4th Year
                    </span>
                  </div>
                </div>

                {/* 2nd Year -> 3rd Year */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                    <div>
                      <span className="text-sm font-semibold text-slate-900">2nd Year Batch</span>
                      <p className="text-xs text-slate-500">{preview?.promotingToThirdYear || 0} students</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                      Promoted to 3rd Year
                    </span>
                  </div>
                </div>

                {/* 1st Year -> 2nd Year */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <div>
                      <span className="text-sm font-semibold text-slate-900">1st Year Batch</span>
                      <p className="text-xs text-slate-500">{preview?.promotingToSecondYear || 0} students</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      Promoted to 2nd Year
                    </span>
                  </div>
                </div>

                {/* Incoming -> 1st Year */}
                <div className="flex items-center justify-between p-3.5 bg-green-50/70 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <div>
                      <span className="text-sm font-semibold text-green-950">New Incoming Batch</span>
                      <p className="text-xs text-green-700">New University Intake</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-green-600" />
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      Becomes New 1st Year
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Configuration */}
          <form onSubmit={handlePromote} className="space-y-5 pt-2">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">
                Target Student Quota for New 1st Year Batch
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={newFirstYearTarget}
                onChange={(e) => setNewFirstYearTarget(parseInt(e.target.value) || 0)}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                placeholder="e.g. 200"
              />
              <p className="text-xs text-slate-500 mt-1">
                The 1st Year batch registration bar will reset to 0/{newFirstYearTarget} ready for new student signups.
              </p>
            </div>

            {/* Safety Confirmation Input */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                Safety Confirmation
              </label>
              <p className="text-xs text-amber-800">
                Type <span className="font-mono font-bold bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950">PROMOTE</span> below to confirm advancing all cohorts.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type PROMOTE"
                className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || confirmText.trim().toUpperCase() !== 'PROMOTE'}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Promoting Batches...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Confirm & Promote Academic Year
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
