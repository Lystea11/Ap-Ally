// src/app/api/rag/ingest/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { TextbookIngestionService } from '@/lib/textbook-ingestion';
import { z } from 'zod';

const IngestSchema = z.object({
  courseName: z.string().min(1, 'Course name is required'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  metadata: z.record(z.any()).optional()
});

export async function POST(request: NextRequest) {
  try {
    // Basic authentication check (you should implement proper auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = IngestSchema.parse(body);

    const ingestionService = new TextbookIngestionService();
    
    await ingestionService.ingestTextbook({
      courseName: validatedData.courseName,
      content: validatedData.content,
      metadata: validatedData.metadata
    });

    const stats = await ingestionService.getIngestionStats();

    return NextResponse.json({
      success: true,
      message: `Successfully ingested content for ${validatedData.courseName}`,
      stats: {
        totalVectors: stats.totalVectors
      }
    });

  } catch (error) {
    console.error('Ingestion error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to ingest content' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const courseName = url.searchParams.get('courseName');

    if (!courseName) {
      return NextResponse.json(
        { success: false, error: 'Course name is required' },
        { status: 400 }
      );
    }

    const ingestionService = new TextbookIngestionService();
    await ingestionService.deleteCourseDocs(courseName);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted content for ${courseName}`
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete content' 
      },
      { status: 500 }
    );
  }
}