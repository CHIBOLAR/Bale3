'use client';

import Link from 'next/link';

interface DemoBannerProps {
  message?: string;
  remaining?: number;
  limit?: number;
  resourceName?: string;
  variant?: 'info' | 'warning';
}

export default function DemoBanner({
  message,
  remaining,
  limit,
  resourceName,
  variant = 'info',
}: DemoBannerProps) {
  // For high limits (shared demo), show general message instead of specific counts
  const isHighLimit = limit && limit >= 100;

  const defaultMessage = message || (isHighLimit
    ? 'Demo Mode: You can freely create and test features. This is a shared demo account. Upgrade for your own private workspace!'
    : remaining !== undefined && limit !== undefined && resourceName
      ? remaining > 0
        ? `Demo Mode: You can create ${remaining} more ${resourceName}. Upgrade for unlimited access!`
        : `Demo Mode: You've reached the limit of ${limit} ${resourceName}. Upgrade for unlimited access!`
      : 'Demo Mode: Explore freely! Upgrade for your own private workspace with full control.');

  const bgColor = variant === 'warning' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200';
  const textColor = variant === 'warning' ? 'text-orange-800' : 'text-blue-800';
  const linkColor = variant === 'warning' ? 'text-orange-600 hover:text-orange-700' : 'text-blue-600 hover:text-blue-700';

  return (
    <div className={`${bgColor} border rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {variant === 'warning' ? (
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {defaultMessage}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <a
              href="https://wa.me/918928466864?text=Hi%2C%20I%27d%20like%20to%20upgrade%20from%20demo%20to%20full%20access"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-sm font-semibold ${linkColor} hover:underline`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Request Full Access
            </a>
            <Link
              href="/dashboard/request-upgrade"
              className={`text-sm font-semibold ${linkColor} hover:underline`}
            >
              Or fill upgrade form →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
