'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [step, setStep] = useState<'loading' | 'send-otp' | 'verify-otp' | 'error'>('loading');
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Validate invite code from URL
  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError('No invite code provided. Please use the link from your invitation email.');
      setStep('error');
      return;
    }

    setInviteCode(code);
    validateInviteCode(code);
  }, [searchParams]);

  const validateInviteCode = async (code: string) => {
    try {
      const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('email, status, expires_at, metadata, invite_type, company_id, role')
        .eq('code', code)
        .single();

      if (inviteError || !invite) {
        setError('Invalid invite code. Please check your invitation link.');
        setStep('error');
        return;
      }

      if (invite.status !== 'approved') {
        setError('This invite has not been approved yet or has already been used.');
        setStep('error');
        return;
      }

      if (new Date(invite.expires_at) < new Date()) {
        setError('This invite has expired. Please request a new invitation.');
        setStep('error');
        return;
      }

      setEmail(invite.email);
      const metadata = invite.metadata as any;
      setIsUpgrade(metadata?.is_demo_upgrade || false);
      setStep('send-otp');
    } catch (err: any) {
      console.error('Error validating invite:', err);
      setError('Failed to validate invite code. Please try again.');
      setStep('error');
    }
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      // Send OTP for verification
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          data: {
            invite_code: inviteCode,
          },
        },
      });

      // Handle rate limit error gracefully - OTP might already be sent
      if (otpError) {
        // If rate limited, assume OTP was already sent and proceed
        if (otpError.message?.includes('security') || otpError.message?.includes('seconds')) {
          console.log('Rate limit hit, but OTP likely already sent');
          setStep('verify-otp');
          return;
        }
        throw otpError;
      }

      setStep('verify-otp');
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
      // Verify OTP
      const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email',
      });

      if (verifyError) throw verifyError;

      if (!authData.user) {
        throw new Error('Failed to verify OTP');
      }

      // Check if user record exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*, companies(*)')
        .eq('auth_user_id', authData.user.id)
        .single();

      // Fetch invite details to determine flow
      const { data: invite } = await supabase
        .from('invites')
        .select('invite_type, company_id, role, metadata')
        .eq('code', inviteCode)
        .single();

      if (!invite) {
        throw new Error('Invite not found');
      }

      if (existingUser && existingUser.is_demo) {
        // Upgrades are now instant and handled by admin approval
        // This code path should not be reached
        throw new Error('Demo upgrades are now handled automatically by admin approval. Please contact support if you received this invite link.');
      } else if (!existingUser) {
        // NEW USER FLOW: Only staff invites are allowed
        const isStaffInvite = invite.invite_type === 'staff' && invite.metadata?.staff_user_id;

        if (!isStaffInvite) {
          // Direct platform signups are not allowed - users must try demo first
          throw new Error('Invalid invite type. New users must try the demo first before requesting full access.');
        }

        // STAFF FLOW: Link auth to existing staff record created by admin
        const staffUserId = (invite.metadata as any).staff_user_id;

        // Update existing staff record with auth_user_id
        const { error: updateError } = await supabase
          .from('users')
          .update({
            auth_user_id: authData.user.id,
            email: email, // Update email in case staff used different email
            updated_at: new Date().toISOString(),
          })
          .eq('id', staffUserId);

        if (updateError) {
          console.error('Error linking staff auth:', updateError);
          throw new Error('Failed to link staff account');
        }

        console.log('✅ Staff linked to auth:', staffUserId);
      }

      // Mark invite as accepted (used)
      await supabase
        .from('invites')
        .update({
          status: 'accepted',
          metadata: {
            ...(invite.metadata || {}),
            used_at: new Date().toISOString(),
            used_by: authData.user.id,
          },
        })
        .eq('code', inviteCode);

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
    await handleSendOTP();
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Invalid Invitation</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <div className="mt-6">
              <Link
                href="/request-invite"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Request New Invitation
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isUpgrade ? 'Upgrade Your Account' : 'Welcome to Bale Inventory'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isUpgrade
              ? 'Your demo account will be upgraded to full access'
              : 'Complete your signup to get started'}
          </p>
        </div>

        {step === 'send-otp' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {email}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                We'll send a verification code to this email
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        )}

        {step === 'verify-otp' && (
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
              {loading ? 'Verifying...' : isUpgrade ? 'Upgrade Account' : 'Create Account'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
