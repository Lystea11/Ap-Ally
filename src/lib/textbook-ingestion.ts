// src/lib/textbook-ingestion.ts

import { getIndex, PineconeRecord, PineconeMetadata } from './pinecone';
import { createEmbeddings, chunkText } from './embeddings';

export interface TextbookContent {
  courseName: string;
  content: string;
  metadata?: Record<string, any>;
}

export class TextbookIngestionService {
  private index = getIndex();

  async ingestTextbook(textbook: TextbookContent): Promise<void> {
    
    const chunks = chunkText(textbook.content);

    const batchSize = 100;
    const batches = this.createBatches(chunks, batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      await this.processBatch(batch, textbook.courseName, i * batchSize);
    }

  }

  private async processBatch(
    chunks: string[], 
    courseName: string, 
    startIndex: number
  ): Promise<void> {
    const embeddings = await createEmbeddings(chunks);
    
    const records: PineconeRecord[] = chunks.map((chunk, i) => ({
      id: `${courseName}_${startIndex + i}`,
      values: embeddings[i],
      metadata: {
        course: courseName,
        chunk: startIndex + i,
        text: chunk,
      } as PineconeMetadata
    }));

    await this.index.upsert(records);
  }

  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  async deleteCourseDocs(courseName: string): Promise<void> {
    
    try {
      await this.index.deleteAll();
    } catch (error) {
      console.error(`Error deleting documents for course ${courseName}:`, error);
      throw error;
    }
  }

  async getIngestionStats(): Promise<{ totalVectors: number }> {
    try {
      const stats = await this.index.describeIndexStats();
      return {
        totalVectors: stats.totalRecordCount || 0
      };
    } catch (error) {
      console.error('Error getting ingestion stats:', error);
      throw error;
    }
  }

  async searchSimilarChunks(
    query: string, 
    courseName?: string, 
    topK: number = 5
  ): Promise<Array<{ text: string; score: number; metadata: PineconeMetadata }>> {
    const { createEmbedding } = await import('./embeddings');
    const queryEmbedding = await createEmbedding(query);

    const searchRequest: any = {
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    };

    if (courseName) {
      searchRequest.filter = {
        course: { $eq: courseName }
      };
    }

    const results = await this.index.query(searchRequest);
    

    const formattedResults = results.matches?.map(match => ({
      text: match.metadata?.text as string || '',
      score: match.score || 0,
      metadata: match.metadata as PineconeMetadata
    })) || [];

    
    return formattedResults;
  }
}