'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

// Prevent static generation - this page needs runtime environment variables
export const dynamic = 'force-dynamic';

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Memoize Supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), []);

  // Pre-fill email from query parameter
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,  // Allow new users to sign up with OTP
          // Omit emailRedirectTo entirely to use OTP-only (no magic link)
        },
      });

      if (otpError) {
        // If rate limited, assume OTP was already sent
        if (otpError.message?.includes('security') || otpError.message?.includes('seconds')) {
          setEmail(normalizedEmail); // Update state with normalized email
          setStep('otp');
          return;
        }
        throw otpError;
      }

      setEmail(normalizedEmail); // Update state with normalized email
      setStep('otp');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Ensure email is normalized (should already be from handleSendOTP)
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: otp,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      // Check if user has approved upgrade request
      const { data: upgradeRequest } = await supabase
        .from('upgrade_requests')
        .select('id, status, name, company')
        .eq('email', normalizedEmail)
        .eq('status', 'approved')
        .maybeSingle();

      if (upgradeRequest) {
        // User has approved upgrade - process it
        console.log('✅ Approved upgrade found, processing...');

        try {
          const response = await fetch('/api/admin/approve-upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requestId: upgradeRequest.id,
              autoUpgrade: true, // Flag to indicate this is auto-upgrade on login
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Upgrade processing failed:', errorData.error);
            setError(`Upgrade failed: ${errorData.error}. Please contact support.`);
            setLoading(false);
            return;
          } else {
            const data = await response.json();
            console.log('✅ Upgrade processed successfully:', data);

            // Upgrade complete - redirect to dashboard with success flag
            // The API response means database transaction is already committed
            router.refresh();

            // Use window.location for a full page reload to ensure fresh data
            window.location.href = '/dashboard?upgraded=true';
            return;
          }
        } catch (upgradeError: any) {
          console.error('❌ Upgrade processing error:', upgradeError);
          setError(`Upgrade error: ${upgradeError.message}. Please contact support.`);
          setLoading(false);
          return;
        }
      }

      // No upgrade needed - normal login redirect
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
    setStep('email');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your approved Bale Inventory account
          </p>
          <p className="mt-1 text-xs text-gray-500">
            (For users whose access request has been approved)
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
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
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Don't have access yet?{' '}
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                Request Access
              </Link>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✅ Verification code sent to <strong>{email}</strong>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Check your inbox and enter the 6-digit code below
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
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
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
