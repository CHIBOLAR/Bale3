'use client'

import { useEffect } from 'react'

interface SuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
}

export default function SuccessDialog({
  isOpen,
  onClose,
  title = 'Success!',
  message,
}: SuccessDialogProps) {
  // Close dialog on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="text-center">
            <h3
              id="dialog-title"
              className="text-2xl font-bold text-brand-blue mb-3"
            >
              {title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-8">{message}</p>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-brand-orange/90 focus:ring-4 focus:ring-brand-orange/20 transition-all shadow-md hover:shadow-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
