import { useState } from 'react';
import Image from 'next/image';
import ImageModal from './ImageModal';

interface GalleryProps {
  images: string[];
  onDelete?: (filename: string) => void;
}

export default function Gallery({ images, onDelete }: GalleryProps) {
  console.log('Gallery rendering with images:', images);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  
  if (images.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No images uploaded yet
      </div>
    );
  }

  const getFilenameFromPath = (path: string) => {
    // Remove leading slash if present and get the last part of the path
    const filename = path.replace(/^\//, '').split('/').pop() || '';
    // Remove the timestamp prefix
    return filename.replace(/^\d+-/, '');
  };

  const currentIndex = selectedImage ? images.indexOf(selectedImage) : -1;
  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      const nextImage = images[currentIndex + 1];
      console.log('Moving to next image:', nextImage);
      setSelectedImage(nextImage);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevImage = images[currentIndex - 1];
      console.log('Moving to previous image:', prevImage);
      setSelectedImage(prevImage);
    }
  };

  const handleImageSelect = (src: string) => {
    console.log('Selecting image:', src);
    // Try to prefetch the image before showing modal
    const img = document.createElement('img');
    img.src = src;
    img.onload = () => {
      console.log('Image preloaded successfully:', src);
      setSelectedImage(src);
    };
    img.onerror = () => {
      console.error('Failed to preload image:', src);
      setImageError(prev => ({ ...prev, [src]: true }));
    };
  };

  return (
    <>
      <div className="space-y-2">
        {images.map((src) => {
          const filename = getFilenameFromPath(src);
          const fullSrc = src.startsWith('http') ? src : `${window.location.origin}${src}`;
          
          return (
            <div 
              key={src} 
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 relative overflow-hidden rounded">
                  {!imageError[src] ? (
                    <Image
                      src={fullSrc}
                      alt={filename}
                      width={48}
                      height={48}
                      className="object-cover"
                      onError={() => setImageError(prev => ({ ...prev, [src]: true }))}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                      Error
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleImageSelect(fullSrc)}
                  className="font-mono text-sm text-gray-600 hover:text-gray-900"
                >
                  {filename}
                </button>
              </div>
              {onDelete && (
                <button
                  onClick={() => onDelete(src)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>

      <ImageModal
        src={selectedImage}
        onClose={() => {
          console.log('Closing modal');
          setSelectedImage(null);
        }}
        onNext={currentIndex < images.length - 1 ? handleNext : undefined}
        onPrev={currentIndex > 0 ? handlePrev : undefined}
      />
    </>
  );
} 