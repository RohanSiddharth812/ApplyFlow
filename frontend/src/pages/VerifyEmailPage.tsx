import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VerifyEmailPage: React.FC = () => {
  const { verifyEmail, resendVerification } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { email?: string; devVerificationUrl?: string } | null;
  const email = state?.email || '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [devUrl, setDevUrl] = useState(state?.devVerificationUrl || '');
  const verifiedOnce = useRef(false);

  useEffect(() => {
    const token = params.get('token');
    if (!token || verifiedOnce.current) return;
    verifiedOnce.current = true;
    setBusy(true);
    verifyEmail(token).then(() => navigate('/onboarding', { replace: true }))
      .catch((err: Error) => setError(err.message || 'This verification link is invalid or expired.'))
      .finally(() => setBusy(false));
  }, [params, verifyEmail, navigate]);

  const handleResend = async () => {
    if (!email) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await resendVerification(email);
      setMessage(result.message);
      if (result.dev_verification_url) setDevUrl(result.dev_verification_url);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not resend verification email.'); }
    finally { setBusy(false); }
  };

  return <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Sparkles /></div>
      <h1 className="text-2xl font-bold text-slate-800">Verify your email</h1>
      <p className="mt-3 text-sm text-slate-600">{busy ? 'Verifying your link…' : `We sent a verification link${email ? ` to ${email}` : ' to your email'}. Open it to activate your ApplyFlow account.`}</p>
      {message && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      {error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {devUrl && <a className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white" href={devUrl}><CheckCircle2 size={17}/> Verify local development account</a>}
      {email && <button disabled={busy} onClick={handleResend} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 disabled:opacity-50"><Mail size={16}/> Resend verification email</button>}
      <p className="mt-6 text-sm text-slate-500"><Link className="font-semibold text-teal-700" to="/login">Return to sign in</Link></p>
    </section>
  </main>;
};
