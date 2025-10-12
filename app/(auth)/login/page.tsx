'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        // If rate limited, assume OTP was already sent
        if (otpError.message?.includes('security') || otpError.message?.includes('seconds')) {
          setStep('otp');
          return;
        }
        throw otpError;
      }

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

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your Bale Inventory account
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
              Don't have an account?{' '}
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                Try Demo
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
