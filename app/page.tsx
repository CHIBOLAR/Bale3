'use client';

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle magic link callback if redirected to homepage
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      // Redirect to proper callback handler
      router.push(`/auth/callback?code=${code}`);
    }
  }, [searchParams, router]);

  const handleTryDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const supabase = createClient();

      console.log('📧 Sending OTP to:', email);

      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          // Don't use emailRedirectTo to avoid PKCE flow
          // Supabase will use the Site URL configured in dashboard
        },
      });

      console.log('📬 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ OTP sent successfully, redirecting to verification page');

      // Redirect to OTP verification page
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error('Error sending magic link:', err);
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold">Bale Inventory</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/request-invite"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Request Access
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Modern Fabric Inventory Management
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Built for Indian textile traders. Track fabric rolls, manage orders,
            and streamline your warehouse operations with barcode-based inventory tracking.
          </p>

          {/* Magic Link Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            {!success ? (
              <form onSubmit={handleTryDemo} className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Try Demo - No Signup Required</h2>
                <p className="text-gray-600 mb-6">
                  Get instant access to explore features with pre-loaded sample data
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Sending...' : 'Try Demo'}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <p className="text-sm text-gray-500">
                  No credit card required. Magic link sent to your email instantly.
                </p>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-2">Check Your Email!</h3>
                <p className="text-gray-600 mb-6">
                  We've sent a magic link to your inbox. Click the link to access the demo instantly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Try another email
                </button>
              </div>
            )}
          </div>

          <p className="text-gray-600">
            Want full access?{' '}
            <Link href="/request-invite" className="text-blue-600 hover:text-blue-700 font-medium">
              Request an invitation →
            </Link>
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Inventory Tracking</h3>
            <p className="text-gray-600">
              Track every fabric roll with barcodes. Monitor stock levels, quality grades, and warehouse locations in real-time.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sales Orders</h3>
            <p className="text-gray-600">
              Manage customer orders from creation to fulfillment. Track order status and link dispatches to orders.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Partner Management</h3>
            <p className="text-gray-600">
              Maintain customer, supplier, and vendor records. Track transactions and communication history.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Barcode System</h3>
            <p className="text-gray-600">
              Generate and scan QR codes for instant stock identification. Mobile-friendly for warehouse operations.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Multi-Warehouse</h3>
            <p className="text-gray-600">
              Manage inventory across multiple locations. Staff users get warehouse-specific access with admin oversight.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Job Work Tracking</h3>
            <p className="text-gray-600">
              Track outsourced processing like dyeing, printing, and embroidery. Monitor progress and costs.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready for Full Access?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Get your own dedicated company account with full features, team collaboration, and priority support.
          </p>
          <Link
            href="/request-invite"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Request Official Access
          </Link>
          <p className="text-blue-100 mt-4 text-sm">
            Includes onboarding call and setup assistance
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Bale Inventory. Built for Indian textile traders.</p>
        </div>
      </footer>
    </div>
  );
}
