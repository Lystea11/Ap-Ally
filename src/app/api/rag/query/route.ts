// src/app/api/rag/query/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';
import { z } from 'zod';

const QuerySchema = z.object({
  query: z.string().min(1, 'Query is required'),
  courseName: z.string().optional(),
  topK: z.number().min(1).max(20).optional().default(5),
  minRelevanceScore: z.number().min(0).max(1).optional().default(0.7)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = QuerySchema.parse(body);

    const ragService = new RAGService();
    const context = await ragService.retrieveContext(validatedData);

    return NextResponse.json({
      success: true,
      data: {
        chunks: context.chunks,
        citations: context.citations,
        totalResults: context.chunks.length
      }
    });

  } catch (error) {
    console.error('RAG query error:', error);

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
        error: 'Failed to process RAG query' 
      },
      { status: 500 }
    );
  }
}