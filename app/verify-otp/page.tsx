'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyOTPContent() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      console.log('✅ OTP verified for:', email);

      // Check if user exists in database, create demo account if not
      if (data.user) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', data.user.id)
          .single();

        if (!existingUser) {
          console.log('🎭 Creating demo account for:', email);

          // Create demo account via API
          const response = await fetch('/api/create-demo-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: data.user.id, email }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create demo account');
          }

          console.log('✅ Demo account created');
        }
      }

      console.log('✅ Redirecting to dashboard');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      alert('New code sent! Check your email.');
    } catch (err: any) {
      console.error('Error resending code:', err);
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
          <p className="text-gray-600 mb-6">
            No email address found. Please start over from the homepage.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
          <p className="text-gray-600">
            We sent a 6-digit code to:
          </p>
          <p className="font-medium text-gray-900 mt-1">{email}</p>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              required
              maxLength={6}
              pattern="\d{6}"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendCode}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50"
          >
            Resend Code
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to homepage
          </Link>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            💡 <strong>Tip:</strong> The code works on any device or browser. You can copy it from your email and paste it here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
