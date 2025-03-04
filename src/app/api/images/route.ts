import { readdir } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  console.log('GET /api/images called');
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    console.log('Reading upload directory:', uploadDir);
    
    try {
      const files = await readdir(uploadDir);
      console.log('Files found in uploads directory:', files);
      const images = files.map(file => `/uploads/${file}`);
      console.log('Returning image paths:', images);
      
      return NextResponse.json({ 
        success: true,
        images: images.sort((a, b) => b.localeCompare(a)) // Sort newest first
      });
    } catch (err) {
      console.error('Error reading upload directory:', err);
      return NextResponse.json({ 
        success: true,
        images: [] 
      });
    }
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json(
      { error: 'Error listing images' },
      { status: 500 }
    );
  }
} 