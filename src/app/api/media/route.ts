import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Media } from '@/models/Media';
import cloudinary from '@/lib/cloudinary';

export async function GET() {
  try {
    await connectDB();
    const mediaList = await Media.find().sort({ createdAt: -1 });
    return NextResponse.json(mediaList);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const maxSizeMB = parseInt(process.env.MEDIA_MAX_FILE_SIZE_MB || '100');
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: `File size exceeds the limit of ${maxSizeMB}MB` }, { status: 400 });
    }

    const type = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : null;
    if (!type) {
      return NextResponse.json({ error: 'Unsupported file type. Please upload an image or video.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to Cloudinary using upload_stream
    const cloudinaryResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'musabaqa_live/media',
          resource_type: type,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    try {
      const media = await Media.create({
        name: file.name,
        type,
        url: cloudinaryResult.secure_url,
        size: cloudinaryResult.bytes,
        mimeType: file.type,
        storageKey: cloudinaryResult.public_id,
        duration: cloudinaryResult.duration // Cloudinary returns duration for videos
      });

      return NextResponse.json(media, { status: 201 });
    } catch (dbError: any) {
      console.error("[MONGODB SAVE ERROR]", dbError);
      // Cleanup orphaned Cloudinary file
      try {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: type });
      } catch (cleanupError) {
        console.error("[CLOUDINARY CLEANUP ERROR]", cleanupError);
      }
      throw new Error('Failed to save media metadata to database');
    }
  } catch (error: any) {
    console.error("[MEDIA UPLOAD ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const media = await Media.findById(id);
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    try {
      await cloudinary.uploader.destroy(media.storageKey, { resource_type: media.type });
    } catch (cloudinaryError: any) {
      console.error("[CLOUDINARY DELETE ERROR]", cloudinaryError);
      // We proceed to delete from DB even if Cloudinary delete fails (e.g., file already gone)
    }

    await Media.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
