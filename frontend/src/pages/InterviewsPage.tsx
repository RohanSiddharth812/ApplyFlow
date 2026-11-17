import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Send, Award, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { Interview, InterviewQuestion } from '../types';
import { api } from '../services/api';

export const InterviewsPage: React.FC = () => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('AI Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  
  // Interactive Answering
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentAnswerText, setCurrentAnswerText] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    loadExistingInterview();
  }, []);

  const loadExistingInterview = async () => {
    try {
      const existing = await api.getInterview('latest');
      setInterview(existing);
      if (existing && existing.questions.length > 0) {
        // Find first unanswered question
        const unans = existing.questions.findIndex(q => !q.user_answer);
        setCurrentQuestionIdx(unans >= 0 ? unans : 0);
      }
    } catch {
      setInterview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNew = async () => {
    setLoading(true);
    try {
      const started = await api.startInterview(role, difficulty);
      setInterview(started);
      setCurrentQuestionIdx(0);
      setCurrentAnswerText('');
    } catch (err: any) {
      alert('Error starting interview: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    const answerToSubmit = currentAnswerText.trim() || (interview?.questions[currentQuestionIdx]?.user_answer ?? '');
    if (!interview || !answerToSubmit) return;
    const currentQ = interview.questions[currentQuestionIdx];
    if (!currentQ) return;

    setEvaluating(true);
    try {
      const evalRes = await api.answerInterviewQuestion(interview.id, currentQ.id, answerToSubmit);
      
      // Update local question
      const updatedQuestions = [...interview.questions];
      updatedQuestions[currentQuestionIdx] = {
        ...currentQ,
        user_answer: evalRes.user_answer,
        feedback: evalRes.feedback,
        score: evalRes.score,
      };

      setInterview({
        ...interview,
        questions: updatedQuestions,
      });

      // Clear answer text
      setCurrentAnswerText('');

      // Advance if more questions exist
      if (currentQuestionIdx < interview.questions.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      }
    } catch (err: any) {
      alert('Error evaluating answer: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  const currentQ = interview?.questions[currentQuestionIdx];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mock Interview Simulator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time AI behavioral and technical interview practice tailored to your target roles.
          </p>
        </div>

        {/* Start New Session Config */}
        <div className="flex items-center gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
          >
            <option value="AI Engineer">AI Engineer</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Data Scientist">Data Scientist</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <button
            onClick={handleStartNew}
            className="px-4 py-1.5 bg-deepsea hover:bg-[#034445] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Start New
          </button>
        </div>
      </div>

      {!interview && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-wisteria/20 text-kimberly-darker flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Start Your First Mock Interview</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
            Select a role and difficulty level above, then click "Start New" to begin an AI-powered practice session.
          </p>
        </div>
      )}
      {!interview && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-wisteria/20 text-kimberly-darker flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Start Your First Mock Interview</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
            Select a role and difficulty level above, then click "Start New" to begin an AI-powered practice session.
          </p>
        </div>
      )}
      {interview && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Question Navigator */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Session</span>
              <h3 className="text-sm font-bold text-slate-800">{interview.role}</h3>
              <p className="text-xs text-slate-500">Difficulty: {interview.difficulty}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Overall Score</span>
                <span className="text-sm font-bold text-niagara">{interview.overall_score || '--'}/100</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2 px-2">Questions</span>
              {interview.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => { setCurrentQuestionIdx(idx); setCurrentAnswerText(''); }}
                  className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between ${
                    currentQuestionIdx === idx
                      ? 'bg-deepsea text-white font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                  }`}
                >
                  <span className="truncate pr-2">Q{idx + 1}. {q.question}</span>
                  {q.score !== null && q.score !== undefined ? (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 ${
                      currentQuestionIdx === idx ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {q.score} pts
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 shrink-0">pending</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Question & Answer Interaction */}
          <div className="lg:col-span-8 space-y-6">
            {currentQ && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-wisteria/20 text-kimberly-darker border border-wisteria/30">
                      {currentQ.question_type}
                    </span>
                    <span className="text-xs text-slate-400">
                      Question {currentQuestionIdx + 1} of {interview.questions.length}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {currentQ.question}
                  </h3>
                </div>

                {/* Candidate Answer Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <span>Your Response</span>
                    {currentQ.user_answer && !currentAnswerText && (
                      <span className="text-emerald-600 font-semibold text-[11px] normal-case bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Answered ✓</span>
                    )}
                  </label>
                  <textarea
                    rows={6}
                    value={currentAnswerText || (currentQ.user_answer ?? '')}
                    onChange={(e) => setCurrentAnswerText(e.target.value)}
                    placeholder="Structure your answer with STAR (Situation, Task, Action, Result) or discuss architectural trade-offs..."
                    className={`w-full p-4 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-1 focus:ring-niagara leading-relaxed text-slate-800 ${
                      currentQ.user_answer && !currentAnswerText ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    {currentQuestionIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => { setCurrentQuestionIdx(currentQuestionIdx - 1); setCurrentAnswerText(''); }}
                        className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                      >
                        Previous
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={evaluating || !(currentAnswerText.trim() || currentQ.user_answer)}
                    onClick={handleAnswerSubmit}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      (currentAnswerText.trim() || currentQ.user_answer) && !evaluating
                        ? 'bg-niagara hover:bg-[#067B80] text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {evaluating ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Submit & Evaluate with AI</span>
                      </>
                    )}
                  </button>
                </div>

                {/* AI Feedback Display */}
                {currentQ.feedback && (
                  <div className="mt-6 p-5 bg-[#F2FCFC] rounded-2xl border border-downy/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-deepsea flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-niagara" />
                        AI Feedback & Assessment
                      </span>
                      <span className="text-xs font-bold text-deepsea px-2.5 py-0.5 rounded-full bg-downy/30">
                        Score: {currentQ.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed pt-1">
                      {currentQ.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
