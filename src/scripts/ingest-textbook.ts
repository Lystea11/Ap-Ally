#!/usr/bin/env tsx
// src/scripts/ingest-textbook.ts

import { readFileSync } from 'fs';
import { TextbookIngestionService } from '../lib/textbook-ingestion';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: tsx src/scripts/ingest-textbook.ts <course-name> <file-path>');
    console.error('Example: tsx src/scripts/ingest-textbook.ts "AP Physics 1" ./textbooks/ap-physics-1.txt');
    process.exit(1);
  }

  const courseName = args[0];
  const filePath = args[1];

  console.log(`Ingesting textbook for course: ${courseName}`);
  console.log(`Reading file: ${filePath}`);

  try {
    let content: string;
    
    try {
      content = readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error(`Error reading file: ${error}`);
      process.exit(1);
    }

    if (!content.trim()) {
      console.error('File is empty or contains only whitespace');
      process.exit(1);
    }

    console.log(`File content length: ${content.length} characters`);

    const ingestionService = new TextbookIngestionService();
    
    await ingestionService.ingestTextbook({
      courseName,
      content,
    });

    const stats = await ingestionService.getIngestionStats();
    console.log(`Total vectors in index: ${stats.totalVectors}`);
    
    console.log('✅ Ingestion completed successfully!');
    
  } catch (error) {
    console.error('❌ Ingestion failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}