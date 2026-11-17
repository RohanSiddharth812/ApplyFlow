import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Download, ArrowLeft, CheckCircle2, AlertTriangle, Sparkles,
  RefreshCw, Check, Copy, Tag
} from 'lucide-react';
import { ResumeDetail, RolePredictionResponse } from '../types';
import { api } from '../services/api';
import { CircularProgress } from '../components/ui/CircularProgress';
import { ProgressBar } from '../components/ui/ProgressBar';

export const ResumeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [resume, setResume] = useState<ResumeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleSuggestions, setRoleSuggestions] = useState<RolePredictionResponse | null>(null);
  const [predictingRoles, setPredictingRoles] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'improvements' | 'keywords' | 'suggestions'>('overview');
  
  // Rewriter state
  const [rewriteOriginal, setRewriteOriginal] = useState('Worked on an AI project using Python.');
  const [rewriteSuggested, setRewriteSuggested] = useState(
    'Developed an AI-powered document retrieval system using Python and RAG techniques to improve information retrieval accuracy by 42%.'
  );
  const [rewriteReasoning, setRewriteReasoning] = useState('Added quantified metrics, action verbs, and highlighted modern RAG architecture.');
  const [rewriting, setRewriting] = useState(false);
  const [usedSuggestion, setUsedSuggestion] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResumeDetail(id);
    }
  }, [id]);

  const fetchResumeDetail = async (resumeId: string) => {
    try {
      const data = await api.getResume(resumeId);
      setResume(data);
      if (data.sections && data.sections.length > 0) {
        setRewriteOriginal(data.sections[0].original_content);
        if (data.sections[0].suggested_content) {
          setRewriteSuggested(data.sections[0].suggested_content);
        }
      }
    } catch (err: any) {
      console.error('Error fetching resume detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const updated = await api.analyzeResume(id);
      setResume(updated);
    } catch (err: any) {
      alert('Analysis failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePredictRoles = async () => {
    if (!id) return;
    setPredictingRoles(true);
    try {
      setRoleSuggestions(await api.predictResumeRoles(id));
    } catch (err: any) {
      alert('Role suggestions failed: ' + err.message);
    } finally {
      setPredictingRoles(false);
    }
  };

  const handleRewrite = async () => {
    if (!id) return;
    setRewriting(true);
    try {
      const result = await api.improveResumeBullet(id, undefined, rewriteOriginal);
      setRewriteSuggested(result.suggested);
      setRewriteReasoning(result.reasoning);
      setUsedSuggestion(false);
    } catch (err: any) {
      alert('Rewrite error: ' + err.message);
    } finally {
      setRewriting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
        <p className="text-sm text-slate-500">Resume not found.</p>
        <button
          onClick={() => navigate('/resumes')}
          className="mt-4 px-4 py-2 bg-niagara text-white rounded-xl text-xs font-bold"
        >
          Back to Resumes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar with Back Button and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePredictRoles}
            disabled={predictingRoles}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <Sparkles className="w-3.5 h-3.5 text-niagara" />
            <span>{predictingRoles ? 'Finding roles…' : 'Suggest roles'}</span>
          </button>
          <button
            onClick={() => navigate('/resumes')}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-wisteria/20 text-kimberly-darker flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {resume.filename}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {resume.target_role}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Analyzed on {new Date(resume.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReanalyze}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-niagara" />
            <span>Re-analyze</span>
          </button>

          <button
            onClick={() => alert('Exporting improved resume in PDF format with optimized ATS layout.')}
            className="px-4 py-2 bg-niagara hover:bg-[#067B80] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Improved Version</span>
          </button>
        </div>
      </div>

      {roleSuggestions && (
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 className="text-sm font-bold text-slate-800">Suggested job categories</h2>
            <span className="text-[11px] text-slate-400">
              {Math.round(roleSuggestions.metrics.top1_accuracy * 100)}% top-1 accuracy on a held-out dataset
            </span>
          </div>
          <div className="space-y-3">
            {roleSuggestions.predictions.map((prediction, index) => (
              <div key={prediction.role} className="flex items-center gap-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-niagara/10 text-niagara flex items-center justify-center font-bold">{index + 1}</span>
                <span className="font-semibold text-slate-700">{prediction.role}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            Suggestions come from resume wording and are a starting point. Check that the categories fit your goals.
          </p>
        </section>
      )}

      {/* Navigation Tabs matching Reference #4 */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'improvements', label: 'Improvements (AI Rewriter)' },
          { key: 'keywords', label: 'Missing Keywords' },
          { key: 'suggestions', label: 'AI Suggestions' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-niagara text-niagara'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW matching Reference #4 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Score & Dimension Bars Card matching Reference #4 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left circular gauge matching Reference #4 (82/100) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-slate-100">
              <CircularProgress
                score={resume.overall_score}
                maxScore={100}
                size={160}
                strokeWidth={12}
                label="Overall Score"
                subtext="Good start! With a few changes, you can do even better."
                color="#08979D"
              />
            </div>

            {/* Right progress bars matching Reference #4 */}
            <div className="lg:col-span-8 space-y-3.5 pr-2">
              <ProgressBar label="ATS Compatibility" value={resume.ats_compatibility} color="bg-niagara" />
              <ProgressBar label="Technical Skills" value={resume.technical_skills_score} color="bg-niagara" />
              <ProgressBar label="Projects" value={resume.projects_score} color="bg-downy" />
              <ProgressBar label="Experience" value={resume.experience_score} color="bg-downy" />
              <ProgressBar label="Keywords" value={resume.keywords_score} color="bg-niagara" />
              <ProgressBar label="Formatting" value={resume.formatting_score} color="bg-niagara" />
            </div>
          </div>

          {/* Key Findings and AI Suggestions Cards matching Reference #4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Findings (Yellow warning icons) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800">Key Findings</h3>
              </div>
              <ul className="space-y-3">
                {resume.key_findings.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Suggestions (Teal check icons) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-niagara" />
                <h3 className="text-sm font-bold text-slate-800">AI Suggestions</h3>
              </div>
              <ul className="space-y-3">
                {resume.ai_suggestions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-niagara mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMPROVEMENTS (AI Resume Rewriter matching Section 10) */}
      {activeTab === 'improvements' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">AI Resume Rewriter</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select or edit a bullet point below to generate high-impact, ATS-optimized suggestions with quantifiable metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ORIGINAL */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  ORIGINAL
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-medium">
                  Current Draft
                </span>
              </div>
              <textarea
                rows={4}
                value={rewriteOriginal}
                onChange={(e) => setRewriteOriginal(e.target.value)}
                className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-niagara"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  disabled={rewriting}
                  onClick={handleRewrite}
                  className="px-4 py-2 bg-kimberly hover:bg-kimberly-dark text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  {rewriting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-downy" />
                  )}
                  <span>Generate AI Suggestion</span>
                </button>
              </div>
            </div>

            {/* AI SUGGESTED */}
            <div className="bg-[#F2FCFC] p-5 rounded-2xl border border-downy/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-deepsea">
                  AI SUGGESTED
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-downy/20 text-deepsea rounded-full font-bold">
                  XYZ Formula
                </span>
              </div>
              <div className="p-3 bg-white border border-downy/30 rounded-xl text-xs text-slate-800 leading-relaxed min-h-[96px]">
                {rewriteSuggested}
              </div>

              {rewriteReasoning && (
                <p className="text-[11px] text-deepsea/80 italic mt-2.5">
                  💡 {rewriteReasoning}
                </p>
              )}

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => alert('Kept original content without modifications.')}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl"
                >
                  Keep Original
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsedSuggestion(true);
                    setRewriteOriginal(rewriteSuggested);
                  }}
                  className={`px-4 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                    usedSuggestion
                      ? 'bg-emerald-600 text-white'
                      : 'bg-niagara hover:bg-[#067B80] text-white shadow-xs'
                  }`}
                >
                  {usedSuggestion ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{usedSuggestion ? 'Applied' : 'Use Suggestion'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MISSING KEYWORDS matching Section 9 */}
      {activeTab === 'keywords' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Target Industry Keywords</h3>
            <p className="text-xs text-slate-500 mt-1">
              Adding these keywords into your skills or projects will increase your match score for {resume.target_role} roles.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">Detected in Resume:</span>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-rose-600 block mb-2">Recommended Missing Keywords:</span>
              <div className="flex flex-wrap gap-2">
                {resume.missing_keywords.map((kw) => (
                  <span key={kw} className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-200 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI SUGGESTIONS */}
      {activeTab === 'suggestions' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800">Actionable Improvement Plan</h3>
          <div className="grid grid-cols-1 gap-3">
            {resume.ai_suggestions.map((sug, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-niagara/10 text-niagara flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">{sug}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
