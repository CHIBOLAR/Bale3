'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { setupCompany } from '@/app/actions/onboarding/setup-company';

export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Form data
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('fabric_trading');
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleNext = () => {
    if (step === 1 && (!companyName || !industry)) {
      setError('Please fill in all required fields');
      return;
    }
    if (step === 2 && (!warehouseName || !warehouseLocation)) {
      setError('Please fill in all required fields');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await setupCompany({
        companyName,
        industry,
        warehouseName,
        warehouseLocation,
        phoneNumber: phoneNumber || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to setup company');
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Error setting up company:', err);
      setError(err.message || 'Failed to setup company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-cream via-white to-blue-50 px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.jpeg" alt="Bale Logo" width={48} height={48} className="rounded-lg" />
            <span className="text-3xl font-bold text-brand-blue">Bale</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Bale!</h1>
          <p className="text-gray-600">Let's set up your fabric inventory management</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    num === step
                      ? 'bg-brand-blue text-white ring-4 ring-brand-blue ring-opacity-20'
                      : num < step
                      ? 'bg-brand-green text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {num < step ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    num
                  )}
                </div>
                {num < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all ${
                      num < step ? 'bg-brand-green' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2 max-w-sm mx-auto">
            <span>Company</span>
            <span>Warehouse</span>
            <span>Contact</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Company Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Information</h2>
                  <p className="text-sm text-gray-600">Tell us about your business</p>
                </div>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    placeholder="Acme Fabrics Ltd."
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="industry"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  >
                    <option value="fabric_trading">Fabric Trading</option>
                    <option value="textile_manufacturing">Textile Manufacturing</option>
                    <option value="garment_manufacturing">Garment Manufacturing</option>
                    <option value="wholesale">Wholesale Distribution</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all"
                >
                  Next Step →
                </button>
              </div>
            )}

            {/* Step 2: Warehouse Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Primary Warehouse</h2>
                  <p className="text-sm text-gray-600">Set up your first warehouse location</p>
                </div>

                <div>
                  <label htmlFor="warehouseName" className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="warehouseName"
                    type="text"
                    required
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    placeholder="Main Warehouse"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">You can add more warehouses later</p>
                </div>

                <div>
                  <label htmlFor="warehouseLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="warehouseLocation"
                    type="text"
                    required
                    value={warehouseLocation}
                    onChange={(e) => setWarehouseLocation(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    placeholder="Mumbai, Maharashtra"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-1/3 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 py-3 px-4 bg-brand-blue text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-all"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
                  <p className="text-sm text-gray-600">Help us stay in touch (optional)</p>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                    placeholder="+91 98765 43210"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">We'll use this for important updates only</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Ready to get started?</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Click "Complete Setup" to create your workspace and start managing your inventory.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="w-1/3 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-brand-green text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Setting up...' : 'Complete Setup ✓'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Progress Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Step {step} of 3 • Takes less than 2 minutes
        </p>
      </div>
    </div>
  );
}
