import { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';

interface ImageModalProps {
  src: string | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function ImageModal({ src, onClose, onNext, onPrev }: ImageModalProps) {
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  console.log('ImageModal rendering with src:', src);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight' && onNext) onNext();
    if (e.key === 'ArrowLeft' && onPrev) onPrev();
  }, [onClose, onNext, onPrev]);

  useEffect(() => {
    console.log('ImageModal mounted/updated with src:', src);
    setImageError(null); // Reset error state when src changes
    
    // Convert relative path to absolute URL if src exists
    if (src) {
      try {
        // Make sure we have the full URL including the origin
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const fullUrl = src.startsWith('http') ? src : `${baseUrl}${src}`;
        console.log('Setting full image URL to:', fullUrl);
        setFullImageUrl(fullUrl);
      } catch (err) {
        console.error('Error creating full URL:', err);
        setImageError('Failed to create image URL');
      }
    } else {
      setFullImageUrl(null);
    }
    
    document.addEventListener('keydown', handleKeyDown);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      console.log('ImageModal cleanup');
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [src, handleKeyDown]);

  const handleImageError = () => {
    console.error('Image failed to load:', fullImageUrl);
    setImageError(`Failed to load image. URL: ${fullImageUrl}`);
    
    // Try to diagnose the issue by fetching the image
    if (fullImageUrl) {
      fetch(fullImageUrl)
        .then(response => {
          if (!response.ok) {
            console.error(`Image fetch failed with status: ${response.status}`);
            setImageError(`Image fetch failed with status: ${response.status}`);
          }
        })
        .catch(err => {
          console.error('Fetch error:', err);
          setImageError(`Network error fetching image: ${err.message}`);
        });
    }
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', fullImageUrl);
    setImageError(null);
  };

  if (!src) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl h-[80vh] bg-gray-900 rounded-lg overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 z-10"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
        
        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 z-10"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
        
        <div className="relative w-full h-full flex items-center justify-center">
          {imageError ? (
            <div className="text-red-500 p-4 bg-black bg-opacity-50 rounded-lg max-w-lg text-center">
              <h3 className="text-xl font-bold mb-2">Error Loading Image</h3>
              <p>{imageError}</p>
              <p className="mt-2 text-sm">Path: {src}</p>
            </div>
          ) : fullImageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={fullImageUrl}
                alt="Uploaded image"
                fill
                unoptimized
                priority
                style={{ objectFit: 'contain' }}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
          ) : (
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-700 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-700 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-700 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-700 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 