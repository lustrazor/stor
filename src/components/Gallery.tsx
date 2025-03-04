import Image from 'next/image';

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images }: GalleryProps) {
  if (images.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No images uploaded yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((src, index) => (
        <div key={src} className="relative aspect-square overflow-hidden rounded-lg shadow-md">
          <Image
            src={src}
            alt={`Uploaded image ${index + 1}`}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      ))}
    </div>
  );
} 