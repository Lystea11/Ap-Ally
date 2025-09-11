# RAG System Implementation Guide

## Overview

This document describes the Retrieval-Augmented Generation (RAG) system implemented for AP-Ally, which enhances AI lesson and roadmap generation with textbook-specific content using Pinecone vector database.

## Architecture

### Components

1. **Pinecone Vector Database**: Stores textbook chunks as 1536-dimensional embeddings
2. **OpenAI Embeddings**: Uses `text-embedding-3-small` for consistent vectorization
3. **RAG Service**: Core service for retrieval and context enhancement
4. **Enhanced AI Flows**: Modified lesson and roadmap generation with textbook context
5. **Citation System**: Tracks and displays source references

### Data Schema

Each Pinecone record follows this structure:
```typescript
{
  id: `${course_name}_${chunk_index}`,
  values: number[], // 1536-dimensional embedding
  metadata: {
    course: string,
    chunk: number,
    text: string
  }
}
```

## Setup

### 1. Environment Variables

Add to your `.env` file:
```bash
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=ap-ally-textbooks
OPENAI_API_KEY=your-openai-api-key
```

### 2. Pinecone Index Setup

Create a Pinecone index with:
- **Dimension**: 1536
- **Metric**: cosine
- **Region**: us-east-1

## Usage

### Textbook Ingestion

#### Command Line (Recommended)
```bash
# Install dependencies
npm install tsx

# Ingest a textbook
tsx src/scripts/ingest-textbook.ts "AP Physics 1" ./textbooks/physics-content.txt

# Test retrieval
tsx src/scripts/test-retrieval.ts "Newton's laws" "AP Physics 1" 5
```

#### API Endpoint
```bash
curl -X POST /api/rag/ingest \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "AP Physics 1",
    "content": "Large textbook content here..."
  }'
```

### Query and Retrieval

#### Direct Service Usage
```typescript
import { RAGService } from '@/lib/rag-service';

const ragService = new RAGService();
const context = await ragService.retrieveContext({
  query: "Newton's laws of motion",
  courseName: "AP Physics 1",
  topK: 5,
  minRelevanceScore: 0.7
});
```

#### API Endpoint
```bash
curl -X POST /api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "photosynthesis process",
    "courseName": "AP Biology",
    "topK": 3
  }'
```

### Integration with AI Flows

The RAG system automatically enhances:

1. **Lesson Generation**: Adds textbook context to lesson content
2. **Roadmap Creation**: Uses course structure from textbooks
3. **Citation Display**: Shows sources in the UI

## File Structure

```
src/
├── lib/
│   ├── pinecone.ts              # Pinecone configuration
│   ├── embeddings.ts            # OpenAI embedding service
│   ├── textbook-ingestion.ts    # Ingestion service
│   ├── rag-service.ts           # Core RAG functionality
│   └── rag-client.ts            # Client-side utilities
├── scripts/
│   ├── ingest-textbook.ts       # CLI ingestion tool
│   └── test-retrieval.ts        # CLI testing tool
├── app/api/rag/
│   ├── query/route.ts           # Query API
│   ├── ingest/route.ts          # Ingestion API
│   └── stats/route.ts           # Statistics API
├── components/
│   └── CitationDisplay.tsx      # Citation UI component
└── ai/flows/
    ├── generate-lesson-content.ts  # Enhanced with RAG
    └── generate-roadmap.ts         # Enhanced with RAG
```

## Features

### Enhanced Content Generation
- **Textbook-Grounded**: All content references actual textbook material
- **Citation Support**: Tracks and displays source references
- **Course-Specific**: Filters content by AP course
- **Relevance Scoring**: Uses cosine similarity for quality retrieval

### Ingestion Pipeline
- **Intelligent Chunking**: Preserves context with overlapping chunks
- **Batch Processing**: Handles large textbooks efficiently
- **Metadata Tracking**: Maintains source attribution
- **Conflict Resolution**: Handles duplicate content gracefully

### Query System
- **Semantic Search**: Vector-based similarity matching
- **Course Filtering**: Restrict results to specific AP courses
- **Relevance Thresholds**: Configurable quality filters
- **Multi-Modal Output**: Supports various content types

## Best Practices

### Content Preparation
1. **Clean Text**: Remove headers, footers, and navigation elements
2. **Consistent Formatting**: Use standard markdown or plain text
3. **Chapter Structure**: Include clear section boundaries
4. **Quality Control**: Verify content accuracy before ingestion

### Query Optimization
1. **Specific Queries**: Use precise topic descriptions
2. **Course Filtering**: Always specify AP course when possible
3. **Relevance Tuning**: Adjust thresholds based on results quality
4. **Batch Queries**: Group related questions for efficiency

### Performance Tuning
1. **Chunk Size**: Balance context vs. precision (default: 1000 chars)
2. **Top-K Selection**: More results = better context but slower processing
3. **Caching**: Implement client-side caching for repeated queries
4. **Index Optimization**: Regular maintenance and updates

## Troubleshooting

### Common Issues

1. **No Results Found**
   - Check course name spelling
   - Lower relevance score threshold
   - Verify content was ingested properly

2. **Poor Quality Results**
   - Increase relevance score threshold
   - Improve query specificity
   - Check textbook content quality

3. **Performance Issues**
   - Reduce top-K parameter
   - Implement query caching
   - Optimize chunk size

### Monitoring

Check system status:
```bash
curl /api/rag/stats
```

Expected response:
```json
{
  "success": true,
  "data": {
    "totalVectors": 15420,
    "indexName": "ap-ally-textbooks",
    "embeddingModel": "text-embedding-3-small",
    "dimension": 1536
  }
}
```

## Future Enhancements

1. **Multi-Modal Support**: Images, diagrams, and video integration
2. **Adaptive Chunking**: Smart content segmentation based on structure
3. **Real-Time Updates**: Live textbook content synchronization
4. **Advanced Filtering**: Subject-specific metadata and filtering
5. **Performance Analytics**: Query performance and quality metrics
6. **Federated Search**: Multiple textbook sources and publishers