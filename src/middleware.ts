import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { existsSync } from 'fs';

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

// This middleware directly serves files from the uploads directory
// to solve the problem of Next.js not detecting new files in Docker production environment
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only process requests for files in the uploads directory
  if (pathname.startsWith('/uploads/')) {
    console.log(`[Middleware] Serving file from: ${pathname}`);
    
    try {
      // Determine the filesystem path based on the URL path
      // In production with Docker, files are in /app/public/uploads
      // In development, they're in public/uploads
      const isDev = process.env.NODE_ENV === 'development';
      const basePath = isDev ? path.join(process.cwd(), 'public') : '/app/public';
      const filePath = path.join(basePath, pathname);
      
      console.log(`[Middleware] Checking file at: ${filePath}`);
      
      // Check if the file exists
      if (!existsSync(filePath)) {
        console.error(`[Middleware] File not found: ${filePath}`);
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
      
      console.log(`[Middleware] Serving ${filePath} as ${contentType}`);
      
      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('[Middleware] Error serving file:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  
  // For all other requests, continue normal processing
  return NextResponse.next();
}

// Configure middleware to only run on upload paths
export const config = {
  matcher: '/uploads/:path*',
}; 