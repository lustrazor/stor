import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  console.log('Upload request received');
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file in request');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name}`);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Ensure unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    console.log(`Upload directory: ${uploadDir}`);
    
    // Create upload directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log('Upload directory created/verified');
    } catch (err) {
      console.error('Error creating upload directory:', err);
      return NextResponse.json(
        { error: 'Failed to create upload directory' },
        { status: 500 }
      );
    }
    
    const filepath = path.join(uploadDir, filename);
    console.log(`Writing file to: ${filepath}`);
    
    try {
      await writeFile(filepath, buffer);
      console.log('File written successfully');
    } catch (err) {
      console.error('Error writing file:', err);
      return NextResponse.json(
        { error: 'Failed to write file to disk' },
        { status: 500 }
      );
    }
    
    const publicPath = `/uploads/${filename}`;
    console.log(`File uploaded successfully: ${publicPath}`);
    
    return NextResponse.json({ 
      success: true,
      filename: publicPath
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 