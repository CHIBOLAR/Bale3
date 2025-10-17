'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInToDemo } from '@/app/actions/auth/demo-login';

interface TryDemoButtonProps {
  variant?: 'primary' | 'secondary' | 'floating' | 'header';
  className?: string;
}

export default function TryDemoButton({ variant = 'primary', className }: TryDemoButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleTryDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInToDemo();

      if (result.error) {
        throw new Error(result.error);
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Error signing in to demo:', err);
      setError(err.message || 'Failed to access demo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed';

    switch (variant) {
      case 'header':
        return `${baseClasses} px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 shadow-md hover:shadow-lg ${className || ''}`;
      case 'primary':
        return `${baseClasses} inline-block px-10 py-4 bg-brand-orange text-white rounded-lg font-bold hover:bg-brand-orange/90 shadow-lg hover:shadow-xl ${className || ''}`;
      case 'secondary':
        return `${baseClasses} px-8 py-3 bg-white text-brand-blue rounded-lg hover:bg-gray-50 shadow-lg hover:shadow-xl ${className || ''}`;
      case 'floating':
        return `${baseClasses} fixed bottom-8 right-8 px-6 py-3 bg-brand-orange text-white rounded-full hover:bg-brand-orange/90 shadow-lg hover:shadow-xl z-40 flex items-center gap-2 ${className || ''}`;
      default:
        return `${baseClasses} ${className || ''}`;
    }
  };

  const getButtonText = () => {
    if (loading) {
      return variant === 'floating' || variant === 'header' ? 'Loading...' : 'Loading Demo...';
    }

    switch (variant) {
      case 'header':
      case 'floating':
        return 'Try Demo';
      case 'primary':
        return 'Try Demo Free';
      case 'secondary':
        return 'Try Demo First';
      default:
        return 'Try Demo';
    }
  };

  return (
    <>
      <button
        onClick={handleTryDemo}
        disabled={loading}
        className={getButtonClasses()}
      >
        <span>{getButtonText()}</span>
        {variant === 'floating' && !loading && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        )}
      </button>

      {error && variant !== 'floating' && variant !== 'header' && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm max-w-md mx-auto">
          {error}
        </div>
      )}
    </>
  );
}
