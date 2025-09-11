// src/app/api/rag/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { TextbookIngestionService } from '@/lib/textbook-ingestion';

export async function GET(request: NextRequest) {
  try {
    const ingestionService = new TextbookIngestionService();
    const stats = await ingestionService.getIngestionStats();

    return NextResponse.json({
      success: true,
      data: {
        totalVectors: stats.totalVectors,
        indexName: process.env.PINECONE_INDEX_NAME || 'ap-ally-textbooks',
        embeddingModel: 'text-embedding-3-small',
        dimension: 1536
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get stats' 
      },
      { status: 500 }
    );
  }
}