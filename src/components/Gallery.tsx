import { useState } from 'react';
import ImageModal from './ImageModal';

interface GalleryProps {
  images: string[];
  onDelete?: (filename: string) => void;
}

export default function Gallery({ images, onDelete }: GalleryProps) {
  console.log('Gallery rendering with images:', images);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
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
    setSelectedImage(src);
  };

  return (
    <>
      <div className="space-y-2">
        {images.map((src) => {
          const filename = getFilenameFromPath(src);
          return (
            <div 
              key={src} 
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <button
                onClick={() => handleImageSelect(src)}
                className="font-mono text-sm text-gray-600 hover:text-gray-900"
              >
                {filename}
              </button>
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