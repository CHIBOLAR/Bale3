'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function FeaturesPage() {
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

      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      category: "Inventory Management",
      items: [
        {
          title: "Smart Inventory Tracking",
          description: "Track fabric stock by roll, meter, or kilogram. See live quantity updates with QR code scanning."
        },
        {
          title: "Multi-Warehouse Support",
          description: "Manage inventory across multiple godowns and warehouses with real-time sync."
        },
        {
          title: "Stock Movement Logging",
          description: "Every roll movement is logged with time, date, and user details for complete traceability."
        },
        {
          title: "Low Stock Alerts",
          description: "Get notified when inventory falls below minimum levels to avoid stockouts."
        }
      ]
    },
    {
      category: "Product Management",
      items: [
        {
          title: "Product Master Database",
          description: "Centralized catalog with fabric details, designs, colors, and specifications."
        },
        {
          title: "Variant Management",
          description: "Track different colors, patterns, and sizes of the same fabric design."
        },
        {
          title: "Batch & Lot Tracking",
          description: "Monitor fabric by batch numbers and lot IDs for quality control."
        }
      ]
    },
    {
      category: "Operations",
      items: [
        {
          title: "Job Work Coordination",
          description: "Create and track job work for embroidery, dyeing, stitching, or printing."
        },
        {
          title: "Goods Dispatch & Receipt",
          description: "Record incoming and outgoing fabric movements with digital challans."
        },
        {
          title: "QR Code Generation",
          description: "Generate and print QR codes in batches. Stick them to rolls for instant scanning."
        },
        {
          title: "Sales Order Management",
          description: "Create, track, and fulfill customer orders with automatic stock updates."
        }
      ]
    },
    {
      category: "Partner Management",
      items: [
        {
          title: "Customer Database",
          description: "Maintain detailed records of buyers with contact info and order history."
        },
        {
          title: "Supplier Management",
          description: "Track your fabric suppliers and their delivery performance."
        },
        {
          title: "Job Worker Directory",
          description: "Manage relationships with embroidery, dyeing, and printing vendors."
        }
      ]
    },
    {
      category: "Reports & Analytics",
      items: [
        {
          title: "Fabric-Specific Reports",
          description: "Track old stock, slow-moving products, and sales performance in one dashboard.",
          comingSoon: true
        },
        {
          title: "Stock Valuation",
          description: "Real-time inventory value calculations for financial planning.",
          comingSoon: true
        },
        {
          title: "Sales Analytics",
          description: "Analyze sales trends, top customers, and revenue patterns.",
          comingSoon: true
        }
      ]
    },
    {
      category: "Access Control",
      items: [
        {
          title: "Role-Based Permissions",
          description: "Control who can view, edit, or delete data with staff roles."
        },
        {
          title: "Multi-User Support",
          description: "Add unlimited team members with customized access levels."
        },
        {
          title: "Activity Audit Log",
          description: "Track all user actions for security and accountability."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.jpeg" alt="Bale Logo" width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold text-brand-blue">Bale</span>
          </Link>
          <a
            href="#invite-form"
            className="px-6 py-2 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 transition-all shadow-md hover:shadow-lg"
          >
            Try Demo
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-blue mb-4">
            All Features
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to manage your fabric inventory business efficiently
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="space-y-10">
          {features.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-3xl font-bold text-brand-blue mb-8">
                {category.category}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {category.items.map((feature, featureIndex) => (
                  <div key={featureIndex} className="bg-white p-6 rounded-xl border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                      {feature.comingSoon && (
                        <span className="inline-block px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-semibold rounded-full whitespace-nowrap ml-2">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
