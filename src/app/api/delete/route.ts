import { unlink } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }

    // Extract just the filename from the path and sanitize it
    const basename = path.basename(filename);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadDir, basename);

    try {
      await unlink(filepath);
      return NextResponse.json({ 
        success: true,
        message: 'File deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting file:', err);
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Error processing delete request' },
      { status: 500 }
    );
  }
} 