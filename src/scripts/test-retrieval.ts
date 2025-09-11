#!/usr/bin/env tsx
// src/scripts/test-retrieval.ts

import { TextbookIngestionService } from '../lib/textbook-ingestion';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: tsx src/scripts/test-retrieval.ts <query> [course-name] [top-k]');
    console.error('Example: tsx src/scripts/test-retrieval.ts "Newton\'s laws of motion" "AP Physics 1" 3');
    process.exit(1);
  }

  const query = args[0];
  const courseName = args[1];
  const topK = args[2] ? parseInt(args[2]) : 5;

  console.log(`Query: ${query}`);
  console.log(`Course: ${courseName || 'All courses'}`);
  console.log(`Top-K: ${topK}`);
  console.log('---\n');

  try {
    const ingestionService = new TextbookIngestionService();
    const results = await ingestionService.searchSimilarChunks(query, courseName, topK);

    if (results.length === 0) {
      console.log('No results found');
      return;
    }

    results.forEach((result, index) => {
      console.log(`Result ${index + 1} (Score: ${result.score.toFixed(4)}):`);
      console.log(`Course: ${result.metadata.course}`);
      console.log(`Chunk: ${result.metadata.chunk}`);
      console.log(`Text: ${result.text.substring(0, 300)}${result.text.length > 300 ? '...' : ''}`);
      console.log('---\n');
    });

    const stats = await ingestionService.getIngestionStats();
    console.log(`Total vectors in index: ${stats.totalVectors}`);
    
  } catch (error) {
    console.error('❌ Retrieval test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}