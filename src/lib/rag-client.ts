// src/lib/rag-client.ts

import { Citation } from './rag-service';

export interface RAGQueryRequest {
  query: string;
  courseName?: string;
  topK?: number;
  minRelevanceScore?: number;
}

export interface RAGQueryResponse {
  success: boolean;
  data?: {
    chunks: Array<{
      text: string;
      score: number;
      source: string;
      metadata: any;
    }>;
    citations: Citation[];
    totalResults: number;
  };
  error?: string;
  details?: any;
}

export interface RAGStatsResponse {
  success: boolean;
  data?: {
    totalVectors: number;
    indexName: string;
    embeddingModel: string;
    dimension: number;
  };
  error?: string;
}

export class RAGClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async query(request: RAGQueryRequest): Promise<RAGQueryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rag/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('RAG query failed:', error);
      return {
        success: false,
        error: 'Failed to query RAG system'
      };
    }
  }

  async getStats(): Promise<RAGStatsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rag/stats`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('RAG stats failed:', error);
      return {
        success: false,
        error: 'Failed to get RAG stats'
      };
    }
  }

  async ingestContent(
    courseName: string,
    content: string,
    authToken: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rag/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          courseName,
          content,
          metadata
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('RAG ingestion failed:', error);
      return {
        success: false,
        error: 'Failed to ingest content'
      };
    }
  }

  async deleteContent(
    courseName: string,
    authToken: string
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/rag/ingest?courseName=${encodeURIComponent(courseName)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('RAG deletion failed:', error);
      return {
        success: false,
        error: 'Failed to delete content'
      };
    }
  }
}