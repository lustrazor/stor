'use client';

import { useState, useEffect } from 'react';
import ImageUploader from '@/components/ImageUploader';
import Gallery from '@/components/Gallery';

export default function Home() {
  const [images, setImages] = useState<string[]>([]);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUploadSuccess = (filename: string) => {
    setImages(prev => [filename, ...prev]);
  };

  const handleDelete = async (filename: string) => {
    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      const data = await response.json();

      if (data.success) {
        setImages(prev => prev.filter(img => img !== filename));
      } else {
        console.error('Failed to delete file:', data.error);
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
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
          <Gallery images={images} onDelete={handleDelete} />
        </div>
      </div>
    </main>
  );
}
