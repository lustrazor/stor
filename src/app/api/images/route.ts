import { readdir } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      const files = await readdir(uploadDir);
      const images = files.map(file => `/uploads/${file}`);
      
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