import { useEffect, useCallback, useState } from 'react';

interface ImageModalProps {
  src: string | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function ImageModal({ src, onClose, onNext, onPrev }: ImageModalProps) {
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
    document.addEventListener('keydown', handleKeyDown);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      console.log('ImageModal cleanup');
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown, src]);

  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative max-w-7xl mx-auto px-4 w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {onPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-8 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {onNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

        <div 
          className="relative aspect-[16/9] max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <p>Error loading image: {imageError}</p>
            </div>
          ) : (
            <img
              src={src}
              alt="Modal view"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error('Image failed to load:', src, e);
                setImageError('Failed to load image');
                // Try to fetch the image directly to see if it's accessible
                fetch(src)
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.blob();
                  })
                  .then(() => console.log('Image is accessible via fetch'))
                  .catch(error => console.error('Image fetch error:', error));
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', src);
                setImageError(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
} 