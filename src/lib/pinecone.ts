// src/lib/pinecone.ts

import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY environment variable is required');
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'ap-ally-textbooks';
export const PINECONE_DIMENSION = 1536;
export const PINECONE_REGION = 'us-east-1';

export const getIndex = () => {
  return pinecone.index(PINECONE_INDEX_NAME);
};

export type PineconeMetadata = {
  course: string;
  chunk: number;
  text: string;
};

export type PineconeRecord = {
  id: string;
  values: number[];
  metadata: PineconeMetadata;
};