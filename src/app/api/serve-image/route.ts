import { NextRequest, NextResponse } from 'next/server';
import { promises as fsPromises } from 'fs';
import { existsSync, createReadStream } from 'fs';
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
      return new NextResponse('No filename provided', { 
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
        }
      });
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
      return new NextResponse(`File not found: ${filename}`, { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        }
      });
    }
    
    try {
      // Read the file
      const fileBuffer = await fsPromises.readFile(filePath);
      
      // Determine the content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      console.log(`Serving ${filename} as ${contentType}, size: ${fileBuffer.length} bytes`);
      
      // Return the file with appropriate headers to avoid caching issues
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Cross-Origin-Resource-Policy': 'cross-origin',
        },
      });
    } catch (readError) {
      console.error(`Error reading file ${filename}:`, readError);
      return new NextResponse(`Error reading file: ${(readError as Error).message}`, { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        }
      });
    }
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse(`Internal server error: ${(error as Error).message}`, { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 