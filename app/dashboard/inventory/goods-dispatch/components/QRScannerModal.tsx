'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Camera, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  availableUnits: any[];
  scannedCount?: number; // Track how many units have been scanned
}

export default function QRScannerModal({ isOpen, onClose, onScan, availableUnits, scannedCount = 0 }: QRScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen && scanning) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, scanning]);

  const startCamera = async () => {
    try {
      setError(null);
      setLastScanned(null);
      setScanSuccess(false);
      setIsScanning(true);

      // Initialize Html5Qrcode if not already initialized
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-video');
      }

      const qrCodeScanner = html5QrCodeRef.current;

      // Configuration for scanning
      const config = {
        fps: 10, // Frames per second
        qrbox: { width: 250, height: 250 }, // Scanning box size
        aspectRatio: 1.0,
      };

      // Start scanning with back camera (environment facing)
      await qrCodeScanner.start(
        { facingMode: 'environment' }, // Use back camera on mobile
        config,
        (decodedText, decodedResult) => {
          // Success callback - QR code detected
          handleQRCodeDetected(decodedText);
        },
        (errorMessage) => {
          // Error callback - usually just scanning, ignore
          // console.log('Scanning...', errorMessage);
        }
      );

      setCameraPermission('granted');
      console.log('Camera started successfully');
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraPermission('denied');
      setIsScanning(false);

      if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
        setError('Camera permission denied. Please enable camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else {
        setError(`Unable to access camera: ${err.message || 'Unknown error'}. Please try manual input below.`);
      }
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && isScanning) {
        await html5QrCodeRef.current.stop();
        console.log('Camera stopped');
      }
      setIsScanning(false);
    } catch (err) {
      console.error('Error stopping camera:', err);
    }
  };

  const handleQRCodeDetected = (decodedText: string) => {
    // Prevent scanning the same code multiple times within 2 seconds
    const now = Date.now();
    if (decodedText !== lastScanned || now - lastScanTimeRef.current > 2000) {
      console.log('QR Code detected:', decodedText);
      setLastScanned(decodedText);
      lastScanTimeRef.current = now;
      processScannedData(decodedText);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      processScannedData(manualInput.trim());
      setManualInput('');
    }
  };

  const processScannedData = (data: string) => {
    console.log('Processing scanned data:', data);
    console.log('Available units count:', availableUnits.length);

    // Parse QR code format: QR-{uuid}-{unit_number}
    // Example: QR-1ea3bca1-fc04-46ac-8d0e-0c246fa608e9-UNIT-000007
    let unitNumber = data;
    let unitId = data;

    // Check if it's a formatted QR code
    if (data.startsWith('QR-')) {
      // Extract unit number after the UUID
      const parts = data.split('-');
      if (parts.length >= 7) {
        // Format: QR-{uuid-part1}-{uuid-part2}-{uuid-part3}-{uuid-part4}-{uuid-part5}-UNIT-{number}
        // Join last parts after UUID to get UNIT-000007
        unitNumber = parts.slice(6).join('-');
        console.log('Extracted unit number from QR:', unitNumber);
      }
      // Also extract the UUID part (might be the ID)
      if (parts.length >= 6) {
        unitId = parts.slice(1, 6).join('-');
        console.log('Extracted UUID from QR:', unitId);
      }
    }

    // Look for the stock unit in available units
    const unit = availableUnits.find(u => {
      const matches = u.unit_number === data ||           // Exact match
                      u.unit_number === unitNumber ||     // Extracted unit number
                      u.id === data ||                     // Exact ID match
                      u.id === unitId ||                   // Extracted UUID
                      u.products?.product_number === data; // Product number
      if (matches) {
        console.log(`✓ Match found! Unit: ${u.unit_number}, ID: ${u.id}`);
      }
      return matches;
    });

    if (unit) {
      console.log('Unit found:', unit.unit_number);
      onScan(data);
      setError(null);
      setScanSuccess(true);

      // Show success toast using React state - longer duration
      setSuccessMessage(`✓ Scanned: ${unit.unit_number}`);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        setScanSuccess(false);
      }, 3000); // 3 seconds instead of 2
    } else {
      console.log('Unit not found for:', data);
      setError(`Stock unit not found: ${data}. Available units: ${availableUnits.length}`);
      setScanSuccess(false);
    }
  };

  const handleClose = async () => {
    await stopCamera();
    setScanning(false);
    setError(null);
    setManualInput('');
    setLastScanned(null);
    setScanSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />

        {/* Modal */}
        <div className="relative w-full max-w-2xl rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Scan QR Code</h2>
              <button
                onClick={handleClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Instructions and Counter */}
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-600 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Scan multiple units • Camera stays active</span>
              </p>
              {scannedCount > 0 && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {scannedCount} unit{scannedCount !== 1 ? 's' : ''} added
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 flex items-start gap-3 rounded-lg bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Camera View */}
            {!scanning ? (
              <div className="mb-6">
                <button
                  onClick={() => setScanning(true)}
                  className="w-full flex items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Camera className="h-8 w-8 text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">Start Camera</p>
                    <p className="text-xs text-gray-500">Click to activate camera and scan QR codes</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="mb-6 relative">
                {/* QR Reader Container - html5-qrcode will inject video here */}
                <div id="qr-reader-video" className="rounded-lg overflow-hidden bg-black"></div>

                {/* Scan Status Indicator */}
                {lastScanned && (
                  <div className={`mt-3 p-3 rounded-lg ${scanSuccess ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <div className="flex items-start gap-2">
                      {scanSuccess ? (
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${scanSuccess ? 'text-green-800' : 'text-yellow-800'}`}>
                          {scanSuccess ? 'Scanned successfully!' : 'Detected'}
                        </p>
                        <p className={`text-xs ${scanSuccess ? 'text-green-600' : 'text-yellow-600'} font-mono mt-0.5`}>
                          {lastScanned}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    stopCamera();
                    setScanning(false);
                  }}
                  className="mt-3 w-full rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                >
                  Stop Camera
                </button>
              </div>
            )}

            {/* Manual Input */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-3 text-sm font-medium text-gray-900">Or enter manually</h3>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter unit number or scan barcode"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </form>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Scanner looks for:</strong> Unit Number, Unit ID, or Product Number
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Available units: {availableUnits.length} • Check browser console for scan logs
                </p>
              </div>
            </div>

            {/* Camera Permission Info */}
            {cameraPermission === 'denied' && (
              <div className="mt-4 rounded-lg bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Camera access blocked.</strong> To enable:
                </p>
                <ul className="mt-2 list-disc list-inside text-xs text-yellow-700">
                  <li>Click the lock/camera icon in your browser's address bar</li>
                  <li>Select "Allow" for camera permissions</li>
                  <li>Refresh the page and try again</li>
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={handleClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* Success Toast - React-based instead of direct DOM manipulation */}
        {showSuccessToast && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl z-[60] animate-fade-in flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-base">{successMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
