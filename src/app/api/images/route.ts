import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  console.log('GET /api/images called');
  
  try {
    // Determine the upload directory based on environment
    const isDev = process.env.NODE_ENV === 'development';
    const uploadDir = isDev 
      ? path.join(process.cwd(), 'public', 'uploads')
      : '/app/public/uploads';
    
    console.log(`Reading upload directory: ${uploadDir}`);
    
    // Get all files in the uploads directory
    const files = await fs.readdir(uploadDir, { withFileTypes: true });
    
    // Filter out directories, only include files
    const fileNames = files
      .filter(file => file.isFile())
      .map(file => file.name);
    
    console.log(`Found ${fileNames.length} files in uploads directory:`, fileNames);
    
    // Create URLs for each file using our API route
    const imagePaths = fileNames.map(fileName => {
      // Add a timestamp to bust cache
      const timestamp = Date.now();
      return `/api/serve-image?file=${fileName}&t=${timestamp}`;
    });
    
    console.log('Returning image paths:', imagePaths);
    
    return NextResponse.json({ images: imagePaths });
  } catch (error) {
    console.error('Error listing images:', error);
    
    // If directory doesn't exist yet, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('Upload directory does not exist yet, returning empty array');
      return NextResponse.json({ images: [] });
    }
    
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500 }
    );
  }
} 