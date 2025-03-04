import { NextRequest, NextResponse } from 'next/server';
import { promises as fsPromises } from 'fs';
import { existsSync } from 'fs';
import path from 'path';

// Map file extensions to MIME types
const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
};

export async function GET(request: NextRequest) {
  try {
    // Get the filename from the query string
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');
    
    if (!filename) {
      console.error('No filename provided in query parameters');
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }
    
    console.log(`Serving image: ${filename}`);
    
    // Determine the filesystem path based on environment
    const isDev = process.env.NODE_ENV === 'development';
    const basePath = isDev ? path.join(process.cwd(), 'public') : '/app/public';
    const filePath = path.join(basePath, 'uploads', filename);
    
    console.log(`Looking for file at: ${filePath}`);
    
    // Check if the file exists
    if (!existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Read the file
    const fileBuffer = await fsPromises.readFile(filePath);
    
    // Determine the content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    console.log(`Serving ${filename} as ${contentType}, size: ${fileBuffer.length} bytes`);
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 