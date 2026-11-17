import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Check, ChevronRight, FileText, Send, Sparkles, RefreshCw,
  Eye, Edit3, ArrowLeft, CheckSquare, Square
} from 'lucide-react';
import { ApplicationPrepareResponse, Resume } from '../types';
import { api } from '../services/api';

export const ApplicationCopilotPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [prepData, setPrepData] = useState<ApplicationPrepareResponse | null>(null);

  // Form selections
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [confirmedReview, setConfirmedReview] = useState(false);

  // Preview Modal state
  const [previewItem, setPreviewItem] = useState<'resume' | 'coverLetter' | null>(null);

  useEffect(() => {
    if (jobId) {
      loadPreparationData(jobId);
    }
  }, [jobId]);

  const loadPreparationData = async (jId: string, resumeId?: string) => {
    setLoading(true);
    try {
      const data = await api.prepareApplication(jId, resumeId);
      setPrepData(data);
      if (data.recommended_resume) {
        setSelectedResumeId(data.recommended_resume.id);
      } else if (data.all_resumes.length > 0) {
        setSelectedResumeId(data.all_resumes[0].id);
      }
      setCoverLetterText(data.generated_cover_letter);
      setAnswers(data.suggested_answers);
    } catch (err: any) {
      console.error('Error preparing application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeChange = (resId: string) => {
    setSelectedResumeId(resId);
    if (jobId) {
      loadPreparationData(jobId, resId);
    }
  };

  const handleAnswerChange = (index: number, newAnswer: string) => {
    const updated = [...answers];
    updated[index].answer = newAnswer;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (!confirmedReview) {
      alert('Please check the confirmation box verifying you have reviewed your application details.');
      return;
    }
    if (!jobId || !selectedResumeId) return;

    setSubmitting(true);
    try {
      await api.submitApplication({
        job_id: jobId,
        resume_id: selectedResumeId,
        cover_letter: coverLetterText,
        answers,
        notes: 'Applied on employer site; recorded via ApplyFlow Application Copilot.',
        confirmed_human_review: true,
      });
      navigate('/applications');
    } catch (err: any) {
      alert('Submission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!prepData) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
        <p className="text-sm text-slate-500">Could not prepare application for this job.</p>
        <button
          onClick={() => navigate('/jobs')}
          className="mt-4 px-4 py-2 bg-niagara text-white rounded-xl text-xs font-bold"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  const selectedResume = prepData.all_resumes.find(r => r.id === selectedResumeId) || prepData.recommended_resume;

  const steps = [
    { num: 1, label: 'Select Resume' },
    { num: 2, label: 'Generate Cover Letter' },
    { num: 3, label: 'Fill Application Details' },
    { num: 4, label: 'Apply & Track' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(`/jobs/${jobId}`)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 4 ? 'Final Review' : 'Application Copilot'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {step === 4
              ? 'Review your materials, apply on the employer site, then record the application.'
              : "We'll prepare your materials. You will apply on the employer's site."}
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-xs font-bold text-slate-800 block">{prepData.job.title}</span>
          <span className="text-[11px] font-semibold text-slate-400">{prepData.job.company}</span>
        </div>
      </div>

      {/* Stepper Wizard Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((s, index) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > s.num
                      ? 'bg-niagara text-white'
                      : step === s.num
                      ? 'bg-deepsea text-white ring-4 ring-niagara/20'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span
                  className={`text-[11px] mt-1.5 font-medium hidden sm:block ${
                    step >= s.num ? 'text-slate-800 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-colors ${
                    step > index + 1 ? 'bg-niagara' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1: SELECT RESUME matching Reference #7 */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Choose the best resume for this job
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ApplyFlow automatically analyzed your uploaded resumes and highlighted the top match.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-wisteria/20 text-kimberly-darker flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <select
                  value={selectedResumeId}
                  onChange={(e) => handleResumeChange(e.target.value)}
                  className="font-bold text-sm text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-niagara"
                >
                  {prepData.all_resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.filename} ({r.target_role})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Best match ({prepData.match_percentage}%)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ATS Score: {selectedResume?.overall_score || 82}/100
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewItem('resume')}
              className="px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 self-start sm:self-center"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>View</span>
            </button>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-deepsea hover:bg-[#034445] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: GENERATE COVER LETTER */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Tailored Cover Letter
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Custom generated for {prepData.job.company} based on your {selectedResume?.filename}. You can edit or regenerate.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadPreparationData(prepData.job.id, selectedResumeId)}
              className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-niagara" />
              <span>Regenerate</span>
            </button>
          </div>

          <textarea
            rows={10}
            value={coverLetterText}
            onChange={(e) => setCoverLetterText(e.target.value)}
            className="w-full p-4 text-xs font-mono leading-relaxed bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-niagara text-slate-800"
          />

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-deepsea hover:bg-[#034445] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: FILL APPLICATION DETAILS */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Application Question Responses
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              AI formulated truthful responses based strictly on your background. Review and adjust if needed.
            </p>
          </div>

          <div className="space-y-4">
            {answers.map((item, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  {item.question}
                </label>
                <textarea
                  rows={3}
                  value={item.answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-niagara text-slate-800 leading-relaxed"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 bg-deepsea hover:bg-[#034445] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: FINAL REVIEW & SUBMIT matching Reference #8 */}
      {step === 4 && (
        <div className="space-y-6">
          {/* 4 Cards Grid matching Reference #8 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Resume */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                    Resume
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {selectedResume?.filename || 'Rohan_Resume_AI.pdf'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-niagara hover:underline"
              >
                Change
              </button>
            </div>

            {/* Card 2: Cover Letter */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                    Cover Letter
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Generated and ready
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-niagara hover:underline"
              >
                Edit
              </button>
            </div>

            {/* Card 3: Application Answers */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                    Application Answers
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {answers.length} questions answered
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs font-semibold text-niagara hover:underline"
              >
                Edit
              </button>
            </div>

            {/* Card 4: Personal Details */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                    Personal Details
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Name, Email, Phone, etc.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                className="text-xs font-semibold text-niagara hover:underline"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-600 mb-3">
              ApplyFlow cannot submit to this employer for you. Open the employer page, complete their application, then return here to track it.
            </p>
            {prepData.job.application_url ? (
              <a href={prepData.job.application_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-niagara text-white text-xs font-bold rounded-xl hover:bg-[#067B80]">
                <Send className="w-3.5 h-3.5" /> Apply on employer site
              </a>
            ) : (
              <p className="text-xs font-semibold text-amber-700">No employer application link is available for this listing.</p>
            )}
          </div>

          {/* Confirm employer application before adding it to the tracker. */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmedReview}
                onChange={(e) => setConfirmedReview(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-deepsea focus:ring-deepsea cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800">
                I reviewed the details and submitted my application on the employer site.
              </span>
            </label>
          </div>

          {/* Buttons matching Reference #8 */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl"
            >
              Back
            </button>

            <button
              type="button"
              disabled={!confirmedReview || submitting}
              onClick={handleSubmit}
              className={`px-8 py-2.5 rounded-xl text-xs font-bold tracking-wide shadow-md transition-all flex items-center gap-2 ${
                confirmedReview && !submitting
                  ? 'bg-deepsea hover:bg-[#034445] text-white shadow-deepsea/20 hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-downy" />
                  <span>Mark as Applied</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal for Resume */}
      {previewItem === 'resume' && selectedResume && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">{selectedResume.filename}</h3>
              <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-xs font-mono text-slate-700 whitespace-pre-line leading-relaxed">
              Target Role: {selectedResume.target_role}
              {'\n\n'}
              ATS Score: {selectedResume.overall_score}/100
              {'\n\n'}
              Ready to attach to your {prepData.job.company} application.
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 bg-niagara text-white text-xs font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
