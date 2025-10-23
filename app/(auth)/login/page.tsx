'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { signInWithGoogle, signInWithEmailOTP, verifyOTP } from '@/lib/auth/providers';

export const dynamic = 'force-dynamic';

function LoginForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'choose-method' | 'email-input' | 'verify-otp'>('choose-method');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Pre-fill email from query parameter
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      setStep('email-input');
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle('/dashboard');
      // The OAuth flow will redirect the user
    } catch (err: any) {
      console.error('Error logging in with Google:', err);
      setError(err.message || 'Failed to log in with Google. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      await signInWithEmailOTP(normalizedEmail);
      setEmail(normalizedEmail);
      setStep('verify-otp');
    } catch (err: any) {
      console.error('Error sending OTP:', err);

      // Handle rate limit gracefully
      if (err.message?.includes('security') || err.message?.includes('seconds')) {
        setEmail(normalizedEmail);
        setStep('verify-otp');
        return;
      }

      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      console.log('🔐 Verifying OTP for email:', normalizedEmail);
      const data = await verifyOTP(normalizedEmail, otp);

      if (!data.user) {
        throw new Error('Failed to verify OTP');
      }

      console.log('✅ OTP verified successfully');

      // Wait for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify session is active
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Session check after OTP:', session ? 'Active' : 'No session');

      if (!session) {
        console.error('❌ No session after OTP verification');
        setError('Session not established. Please try again.');
        setLoading(false);
        return;
      }

      // Setup user if first time (creates company, user record, warehouse)
      try {
        const setupResponse = await fetch('/api/auth/setup', { method: 'POST' });
        const setupResult = await setupResponse.json();

        if (!setupResult.success && !setupResult.alreadyExists) {
          console.error('Setup failed:', setupResult.error);
          setError('Failed to setup your account. Please try again.');
          setLoading(false);
          return;
        }
      } catch (setupError) {
        console.error('Setup error:', setupError);
        // Continue anyway - might be existing user
      }

      // Login successful - redirect to dashboard
      console.log('✅ Login successful, redirecting to dashboard');
      router.refresh();
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailOTP(email);
      setError(null);
    } catch (err: any) {
      console.error('Error resending OTP:', err);
      if (!err.message?.includes('security') && !err.message?.includes('seconds')) {
        setError(err.message || 'Failed to resend code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-blue-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.jpeg" alt="Bale Logo" width={48} height={48} className="rounded-lg" />
            <span className="text-3xl font-bold text-brand-blue">Bale</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Choose Method Step */}
          {step === 'choose-method' && (
            <div className="space-y-4">
              {/* Google OAuth Button - Primary */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Connecting...' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or sign in with email</span>
                </div>
              </div>

              {/* Email OTP Button - Secondary */}
              <button
                onClick={() => setStep('email-input')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-brand-blue rounded-lg text-brand-blue font-semibold hover:bg-brand-blue hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Sign in with Email
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mt-4">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Email Input Step */}
          {step === 'email-input' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <button
                type="button"
                onClick={() => setStep('choose-method')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to login options
              </button>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  placeholder="you@company.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Sending code...' : 'Send verification code'}
              </button>
            </form>
          )}

          {/* Verify OTP Step */}
          {step === 'verify-otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <button
                type="button"
                onClick={() => {
                  setStep('email-input');
                  setOtp('');
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Change email
              </button>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✅ Verification code sent to <strong>{email}</strong>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Check your inbox and enter the 6-digit code below
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Verifying...' : 'Sign in'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-sm text-brand-blue hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-brand-blue hover:text-blue-700">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-blue-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
