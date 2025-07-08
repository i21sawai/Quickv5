import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from 'firebase-admin/storage';
import { db } from '@/database/firestore'; // This ensures Firebase Admin is initialized

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    
    // Validate path to prevent directory traversal
    if (path.includes('..') || path.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      );
    }

    // Get storage instance
    const storage = getStorage();
    const bucketName = process.env.BUCKET_NAME || process.env.NEXT_PUBLIC_BUCKET_NAME;
    const bucket = storage.bucket(bucketName);
    
    // Get file from storage
    const file = bucket.file(path);
    const [exists] = await file.exists();
    
    if (!exists) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Download file content
    const [contents] = await file.download();
    
    // Parse JSON content
    const data = JSON.parse(contents.toString());
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Storage access error:', error);
    return NextResponse.json(
      { error: 'Failed to access storage' },
      { status: 500 }
    );
  }
}