import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      if (isSignUp) {
        if (!fullName) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }
        const result = await register(email, password, fullName);
        navigate('/verify-email', { state: { email, devVerificationUrl: result.dev_verification_url } });
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* LEFT SIDE: Stylized branding & mountain wave landscape matching Reference #1 */}
      <div className="w-full md:w-5/12 bg-gradient-to-b from-[#EFE8F5] via-[#E2D4EB] to-[#CCABD8] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-niagara to-downy flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#433857]">ApplyFlow</span>
          </div>

          <div className="mt-16 sm:mt-24 max-w-sm">
            <h1 className="text-4xl sm:text-5xl font-black text-[#3E2E55] leading-tight tracking-tight">
              Find.<br />
              Apply.<br />
              Grow.
            </h1>
            <p className="mt-4 text-base font-medium text-[#5F4B78] leading-relaxed">
              Your AI-powered job application assistant.
            </p>

            <div className="mt-8 space-y-2.5">
              {[
                'AI Resume Analysis & ATS Checker',
                'Transparent Job & Skill Matching',
                'Automated Application Copilot',
                'Interactive Mock Interview Prep'
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-xs font-semibold text-[#4C3B63]">
                  <CheckCircle2 className="w-4 h-4 text-niagara shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mountain Wave Graphic at bottom */}
        <div className="relative z-10 mt-12 pt-8">
          <p className="text-xs font-semibold text-deepsea/90 tracking-wide">
            Better opportunities start with a smarter approach.
          </p>
        </div>

        {/* SVG stylized layered mountain wave illustration matching reference image */}
        <div className="absolute bottom-0 left-0 right-0 w-full h-48 pointer-events-none opacity-90">
          <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="w-full h-full">
            {/* Back mountain */}
            <path
              d="M0,130 Q120,70 240,110 T500,80 L500,200 L0,200 Z"
              fill="#6EC6CA"
              opacity="0.4"
            />
            {/* Middle mountain */}
            <path
              d="M0,150 Q160,90 320,140 T500,110 L500,200 L0,200 Z"
              fill="#08979D"
              opacity="0.7"
            />
            {/* Front mountain */}
            <path
              d="M0,170 Q140,130 280,160 T500,130 L500,200 L0,200 Z"
              fill="#055B5C"
            />
          </svg>
        </div>
      </div>

      {/* RIGHT SIDE: Clean modern SaaS Auth Form matching Reference #1 */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isSignUp ? 'Get started with your intelligent job copilot' : 'Sign in to continue to ApplyFlow'}
            </p>
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              or
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required={isSignUp}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rohan Siddharth"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link has been dispatched to your email.')}
                    className="text-[11px] font-medium text-niagara hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-niagara/20 focus:border-niagara"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-deepsea to-niagara hover:from-[#034445] hover:to-[#067B80] text-white rounded-xl text-xs font-bold tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access banner */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-niagara hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
