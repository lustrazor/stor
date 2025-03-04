'use client';

import { useState, useEffect, useCallback } from 'react';
import ImageUploader from '@/components/ImageUploader';
import Gallery from '@/components/Gallery';

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      console.log('Fetching images from API...');
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/images?t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Images API response:', data);
      
      if (data.images) {
        setImages(data.images);
      } else {
        console.warn('Images data structure not as expected:', data);
        setImages([]);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
    
    // Set up periodic refresh of images
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing images...');
      fetchImages();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchImages]);

  const handleUploadSuccess = (filename: string) => {
    console.log('Upload success, refreshing images...');
    fetchImages(); // Reload all images to ensure we have the latest list
  };

  const handleDelete = async (imagePath: string) => {
    try {
      // Extract filename from path (remove /uploads/ prefix and any query params)
      const filename = imagePath.replace('/uploads/', '').split('?')[0];
      console.log('Deleting image:', filename);
      
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Successfully deleted image, refreshing list...');
        fetchImages(); // Reload all images instead of manipulating state
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
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <Gallery images={images} onDelete={handleDelete} />
          )}
          
          <div className="mt-4 flex justify-center">
            <button 
              onClick={fetchImages}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Images
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
