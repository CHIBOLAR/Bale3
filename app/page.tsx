'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.jpeg" alt="Bale Logo" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold text-brand-blue">Bale</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-brand-blue font-semibold hover:text-brand-orange transition-colors"
            >
              Login
            </Link>
            <a
              href="#invite-form"
              className="px-6 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-all shadow-md hover:shadow-lg"
            >
              Try Demo
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center max-w-5xl mx-auto mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-brand-blue mb-6 leading-tight">
            Every Roll Matters.<br/>
            Let's make sure it's counted.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            That's why we built a tool that keeps your fabric organised and lets you focus on important tasks.
          </p>

          <a
            href="#invite-form"
            className="inline-block px-10 py-4 bg-brand-orange text-white rounded-lg font-bold hover:bg-brand-orange/90 transition-all shadow-lg hover:shadow-xl"
          >
            Try Demo
          </a>
        </div>
      </section>

      {/* Why Fabric Traders Choose Bale - B.A.L.E */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-4xl font-bold text-center mb-3 text-brand-blue">Why fabric traders choose Bale</h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Because every feature of Bale is built around how your business actually works.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="text-left">
            <div className="mb-4">
              <span className="text-5xl font-bold text-brand-blue">B</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Better visibility</h3>
            <p className="text-gray-600 leading-relaxed">
              Know your stock by rolls, color, and meters.
            </p>
          </div>

          <div className="text-left">
            <div className="mb-4">
              <span className="text-5xl font-bold text-brand-orange">A</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Accuracy in every order</h3>
            <p className="text-gray-600 leading-relaxed">
              Sync stock, dispatch, and sales data seamlessly.
            </p>
          </div>

          <div className="text-left">
            <div className="mb-4">
              <span className="text-5xl font-bold text-brand-green">L</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Log every movement</h3>
            <p className="text-gray-600 leading-relaxed">
              Track every roll with time, date, and user.
            </p>
          </div>

          <div className="text-left">
            <div className="mb-4">
              <span className="text-5xl font-bold text-brand-blue">E</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Easy for everyone</h3>
            <p className="text-gray-600 leading-relaxed">
              Scan, dispatch, and update in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Invite Form Section */}
      <section id="invite-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10 max-w-2xl mx-auto">
          {!success ? (
            <form onSubmit={handleTryDemo} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-block mb-4">
                  <span className="bg-brand-orange/10 text-brand-orange px-4 py-2 rounded-full text-sm font-semibold">
                    ₹499/month introductory price
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-brand-blue mb-3">
                  Try Bale Demo
                </h2>
                <p className="text-gray-600">
                  We're honest about earning. You pay for what you use, and we grow together.
                </p>
              </div>

              <div className="text-left space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="business" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    id="business"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Fabric Business"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {loading ? 'Sending...' : 'Try Demo'}
              </button>
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
                We've sent a verification code to your inbox. Enter it to access the demo instantly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-brand-blue hover:text-brand-orange font-medium"
              >
                Try another email
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-4xl font-bold text-center mb-8 text-brand-blue">See Bale in Action</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-brand-orange mb-2 block">Feature #1</span>
            <h3 className="text-xl font-bold mb-3 text-brand-blue">Smart Inventory Tracking</h3>
            <p className="text-gray-600 leading-relaxed">
              Track fabric stock by roll, meter, or kilogram. See live quantity updates with QR code
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-brand-orange mb-2 block">Feature #2</span>
            <h3 className="text-xl font-bold mb-3 text-brand-blue">Job Work Coordination</h3>
            <p className="text-gray-600 leading-relaxed">
              Create and track job work for embroidery, dyeing, stitching, or printing so you don't need to call
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-brand-orange mb-2 block">Feature #3</span>
            <h3 className="text-xl font-bold mb-3 text-brand-blue">QR Code Generation</h3>
            <p className="text-gray-600 leading-relaxed">
              Generate and print QRs in batches. Stick them to rolls and scan to update instantly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl border border-gray-100">
            <span className="text-sm font-semibold text-brand-orange mb-2 block">Feature #4</span>
            <h3 className="text-xl font-bold mb-3 text-brand-blue">Fabric-Specific Reports</h3>
            <p className="text-gray-600 leading-relaxed mb-2">
              See reports to track old and slow moving products, sales performance in one dashboard
            </p>
            <span className="inline-block px-3 py-1 bg-brand-orange/10 text-brand-orange text-sm font-semibold rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">...and much more</p>
          <Link
            href="/features"
            className="inline-block px-8 py-3 bg-brand-blue text-white rounded-lg font-semibold hover:bg-brand-blue/90 transition-all shadow-md hover:shadow-lg"
          >
            See All Features
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-4xl font-bold text-center mb-8 text-brand-blue">Frequently Asked Questions</h2>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-bold mb-2 text-gray-900">What exactly does Bale do?</h3>
            <p className="text-gray-600">
              Bale is an all-in-one inventory app built for fabric traders. It tracks every roll, manages job work, and keeps your warehouses in sync.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-bold mb-2 text-gray-900">How is Bale different from Tally or ERP software?</h3>
            <p className="text-gray-600">
              Bale is built for fabric-specific workflows. Not too simple like generic apps, not too complex like enterprise ERPs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-bold mb-2 text-gray-900">How is my data safe from other fabric traders?</h3>
            <p className="text-gray-600">
              Bale is built on a multi-tenant architecture in Supabase ensuring data isolation with strict data access control. We achieve this with the help of Authorization via Row Level Security
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h3 className="text-lg font-bold mb-2 text-gray-900">Will my staff be able to use it easily?</h3>
            <p className="text-gray-600">
              Yes, Bale is designed for simple, tap-based workflows — scan, update, done.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 bg-white/50 py-8 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Built for fabric traders.</p>

            {/* Social Sharing Buttons */}
            <div className="flex justify-center gap-3 mb-6">
              <a
                href="https://wa.me/918928466864?text=Hi%2C%20I%27m%20interested%20in%20Bale%20inventory%20app"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all shadow-md hover:shadow-lg"
                aria-label="Contact us on WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>

              <a
                href="https://www.instagram.com/bale.fab.inventory.app"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white rounded-full transition-all shadow-md hover:shadow-lg"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61581769324718"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all shadow-md hover:shadow-lg"
                aria-label="Follow us on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-brand-blue">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-brand-blue">Terms of Use</Link>
              <a href="mailto:bale.inventory@gmail.com" className="hover:text-brand-blue">Contact: bale.inventory@gmail.com</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Try Demo Button */}
      <a
        href="#invite-form"
        className="fixed bottom-8 right-8 px-6 py-3 bg-brand-orange text-white rounded-full font-semibold hover:bg-brand-orange/90 transition-all shadow-lg hover:shadow-xl z-40 flex items-center gap-2"
      >
        <span>Try Demo</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </a>
    </div>
  );
}
