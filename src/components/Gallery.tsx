import { useState } from 'react';
import Image from 'next/image';
import ImageModal from './ImageModal';

interface GalleryProps {
  images: string[];
  onDelete?: (imgPath: string) => void;
}

export default function Gallery({ images, onDelete }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  console.log('Gallery rendering with images:', images);

  const handleImageSelect = (img: string) => {
    console.log('Selecting image:', img);
    setSelectedImage(img);
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setSelectedImage(null);
  };

  const handleNext = () => {
    if (!selectedImage || images.length <= 1) return;
    const currentIndex = images.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % images.length;
    const nextImage = images[nextIndex];
    console.log('Next image:', nextImage);
    setSelectedImage(nextImage);
  };

  const handlePrev = () => {
    if (!selectedImage || images.length <= 1) return;
    const currentIndex = images.indexOf(selectedImage);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    const prevImage = images[prevIndex];
    console.log('Previous image:', prevImage);
    setSelectedImage(prevImage);
  };

  const extractFilename = (path: string) => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div className="mt-8">
      
      {images.length === 0 ? (
        <p className="text-gray-500">No images uploaded yet.</p>
      ) : (
        <div className="space-y-4">
          {images.map((img) => (
            <div key={img} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => handleImageSelect(img)}
                  className="h-16 w-16 bg-gray-700 rounded overflow-hidden flex items-center justify-center"
                  aria-label={`View ${extractFilename(img)}`}
                >
                  <Image 
                    src={img} 
                    alt={extractFilename(img)} 
                    width={64} 
                    height={64} 
                    className="object-cover h-full w-full"
                    unoptimized
                    onError={() => {
                      console.error('Thumbnail failed to load:', img);
                    }}
                  />
                </button>
                <span className="text-gray-300">{extractFilename(img)}</span>
              </div>
              
              {onDelete && (
                <button
                  onClick={() => onDelete(img)}
                  className="text-red-500 hover:text-red-400"
                  aria-label={`Delete ${extractFilename(img)}`}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <ImageModal 
          src={selectedImage} 
          onClose={handleCloseModal}
          onNext={images.length > 1 ? handleNext : undefined}
          onPrev={images.length > 1 ? handlePrev : undefined}
        />
      )}
    </div>
  );
} 