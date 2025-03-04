import { useEffect, useCallback, useState, useRef } from 'react';

interface ImageModalProps {
  src: string | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function ImageModal({ src, onClose, onNext, onPrev }: ImageModalProps) {
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [useIframe, setUseIframe] = useState(false);
  const [useBlobUrl, setUseBlobUrl] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  console.log('ImageModal rendering with src:', src);

  // Clean up any object URLs when the component unmounts
  useEffect(() => {
    return () => {
      if (objectUrl) {
        console.log('Revoking object URL:', objectUrl);
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight' && onNext) onNext();
    if (e.key === 'ArrowLeft' && onPrev) onPrev();
  }, [onClose, onNext, onPrev]);

  // Load the image via fetch and create an object URL
  const loadImageAsObjectUrl = useCallback(async (url: string) => {
    try {
      console.log('Fetching image from URL:', url);
      setImageError(null);
      
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('Received blob:', blob.type, 'size:', blob.size);
      
      if (blob.size === 0) {
        throw new Error('Empty response received');
      }
      
      // Revoke any existing object URL
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      
      // Create a new object URL
      const newObjectUrl = URL.createObjectURL(blob);
      console.log('Created object URL:', newObjectUrl);
      setObjectUrl(newObjectUrl);
      setFullImageUrl(newObjectUrl);
      setUseBlobUrl(true);
      
      return true;
    } catch (error) {
      console.error('Error loading image via fetch:', error);
      setImageError(`Failed to load image: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }, [objectUrl]);

  useEffect(() => {
    console.log('ImageModal mounted/updated with src:', src);
    setImageError(null); // Reset error state when src changes
    setImageLoaded(false);
    setRetryCount(0);
    setUseIframe(false);
    setUseBlobUrl(false);
    
    // Convert relative path to absolute URL if src exists
    if (src) {
      try {
        // The src should already be a proper API route with a timestamp
        // but we'll make sure it has the full origin
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const fullUrl = src.startsWith('http') ? src : `${baseUrl}${src}`;
        
        console.log('Setting full image URL to:', fullUrl);
        
        // Try to load the image directly first
        setFullImageUrl(fullUrl);
        
        // Also try to load it as an object URL to bypass potential CORS issues
        loadImageAsObjectUrl(fullUrl).then(success => {
          if (!success) {
            console.log('Object URL creation failed, falling back to direct URL');
          }
        });
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
  }, [src, handleKeyDown, loadImageAsObjectUrl]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image failed to load:', fullImageUrl);
    console.error('Error event:', e);
    setImageError(`Failed to load image. URL: ${fullImageUrl}`);
    setImageLoaded(false);
    
    // If we've already tried blob URL and iframe, try direct URL
    if (useBlobUrl) {
      setUseBlobUrl(false);
      return;
    }
    
    // After the first error, switch to iframe mode
    if (!useIframe && !useBlobUrl) {
      console.log('Switching to iframe mode for image loading');
      setUseIframe(true);
      return;
    }
    
    // Finally, try to load as object URL again with a fresh timestamp
    const timestamp = Date.now();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    // Create a URL with a refreshed timestamp
    let refreshedUrl;
    if (src && src.includes('api/serve-image')) {
      const url = new URL(src.startsWith('http') ? src : `${baseUrl}${src}`);
      url.searchParams.set('t', timestamp.toString());
      refreshedUrl = url.toString();
      
      console.log('Retrying with refreshed URL:', refreshedUrl);
      loadImageAsObjectUrl(refreshedUrl);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('Image loaded successfully:', fullImageUrl);
    console.log('Image size:', (e.target as HTMLImageElement).naturalWidth, 'x', (e.target as HTMLImageElement).naturalHeight);
    setImageError(null);
    setImageLoaded(true);
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
          {imageError && !useIframe ? (
            <div className="text-red-500 p-4 bg-black bg-opacity-50 rounded-lg max-w-lg text-center">
              <h3 className="text-xl font-bold mb-2">Error Loading Image</h3>
              <p>{imageError}</p>
              <p className="mt-2 text-sm">Path: {src}</p>
              <p className="mt-1 text-sm">Retry count: {retryCount}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button 
                  onClick={() => {
                    // Re-attempt to load the image with a new timestamp
                    setImageError(null);
                    setImageLoaded(false);
                    setRetryCount(prevCount => prevCount + 1);
                    
                    const timestamp = Date.now();
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                    
                    // Create a URL with a refreshed timestamp
                    let refreshedUrl;
                    if (src.includes('api/serve-image')) {
                      const url = new URL(src.startsWith('http') ? src : `${baseUrl}${src}`);
                      url.searchParams.set('t', timestamp.toString());
                      refreshedUrl = url.toString();
                    } else {
                      refreshedUrl = src.startsWith('http') 
                        ? `${src}?t=${timestamp}` 
                        : `${baseUrl}${src}?t=${timestamp}`;
                    }
                    
                    console.log('Retrying with URL:', refreshedUrl);
                    setFullImageUrl(refreshedUrl);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry Direct Loading
                </button>
                <button 
                  onClick={() => {
                    setUseIframe(true);
                    setImageError(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Try iframe View
                </button>
                <button 
                  onClick={() => {
                    setImageError(null);
                    setRetryCount(prevCount => prevCount + 1);
                    
                    const timestamp = Date.now();
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                    
                    // Create a URL with a refreshed timestamp
                    let refreshedUrl;
                    if (src.includes('api/serve-image')) {
                      const url = new URL(src.startsWith('http') ? src : `${baseUrl}${src}`);
                      url.searchParams.set('t', timestamp.toString());
                      refreshedUrl = url.toString();
                    } else {
                      refreshedUrl = src.startsWith('http') 
                        ? `${src}?t=${timestamp}` 
                        : `${baseUrl}${src}?t=${timestamp}`;
                    }
                    
                    loadImageAsObjectUrl(refreshedUrl);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Try Blob URL
                </button>
              </div>
            </div>
          ) : !imageLoaded && !useIframe && fullImageUrl ? (
            <div className="animate-pulse flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-white">Loading image...</p>
              <p className="mt-2 text-sm text-gray-400">URL: {fullImageUrl?.substring(0, 50)}...</p>
              <p className="mt-1 text-sm text-gray-400">Using {useBlobUrl ? 'blob URL' : 'direct URL'}</p>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => setUseIframe(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Try iframe View
                </button>
                {!useBlobUrl && (
                  <button 
                    onClick={() => {
                      if (src) {
                        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                        const fullUrl = src.startsWith('http') ? src : `${baseUrl}${src}`;
                        loadImageAsObjectUrl(fullUrl);
                      }
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Try Blob URL
                  </button>
                )}
              </div>
            </div>
          ) : useIframe && fullImageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-gray-800">
              <iframe 
                src={fullImageUrl}
                className="w-full h-full border-0"
                title="Image content"
                sandbox="allow-same-origin"
                allowFullScreen
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button 
                  onClick={() => {
                    setUseIframe(false);
                    setUseBlobUrl(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Try Direct Image
                </button>
                <button 
                  onClick={() => {
                    if (src) {
                      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                      const fullUrl = src.startsWith('http') ? src : `${baseUrl}${src}`;
                      loadImageAsObjectUrl(fullUrl).then(() => {
                        setUseIframe(false);
                      });
                    }
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Try Blob URL
                </button>
              </div>
            </div>
          ) : fullImageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                ref={imgRef}
                src={fullImageUrl}
                alt="Uploaded image"
                crossOrigin="anonymous"
                className="max-h-full max-w-full object-contain"
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{background: 'transparent'}}
              />
              {useBlobUrl && (
                <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 text-xs rounded">
                  Using Blob URL
                </div>
              )}
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