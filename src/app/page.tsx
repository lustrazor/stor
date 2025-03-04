'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import Gallery from '@/components/Gallery';

export default function Home() {
  const [images, setImages] = useState<string[]>([]);

  const handleUploadSuccess = (filename: string) => {
    setImages(prev => [filename, ...prev]);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Image Gallery</h1>
          <p className="text-gray-600">Upload and view your images</p>
        </div>

        <ImageUploader onUploadSuccess={handleUploadSuccess} />
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Uploaded Images</h2>
          <Gallery images={images} />
        </div>
      </div>
    </main>
  );
}
