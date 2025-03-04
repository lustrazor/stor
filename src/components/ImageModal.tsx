import { useEffect, useCallback, useState } from 'react';

interface ImageModalProps {
  src: string | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function ImageModal({ src, onClose, onNext, onPrev }: ImageModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('ImageModal rendering with src:', src);

  useEffect(() => {
    // Add event listener for the Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // Reset state when src changes
  useEffect(() => {
    if (src) {
      setLoading(true);
      setError(null);
    }
  }, [src]);

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setLoading(false);
  };

  const handleImageError = () => {
    console.error('Failed to load image:', src);
    setLoading(false);
    setError('Failed to load image. Please try again.');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        {/* Close button */}
        <button 
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Navigation buttons if available */}
        {onPrev && (
          <button 
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {onNext && (
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 z-10"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {/* Content area */}
        <div className="bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-white">Loading image...</p>
            </div>
          )}
          
          {error && (
            <div className="text-red-500 p-8 text-center">
              <p>{error}</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  // Force a reload by adding a timestamp
                  const refreshedSrc = src.includes('?') 
                    ? `${src}&t=${Date.now()}` 
                    : `${src}?t=${Date.now()}`;
                  const img = new Image();
                  img.src = refreshedSrc;
                }}
              >
                Retry
              </button>
            </div>
          )}
          
          <img
            src={src}
            alt="Full size"
            className={`max-w-full max-h-[80vh] object-contain ${loading ? 'hidden' : 'block'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      </div>
    </div>
  );
} 