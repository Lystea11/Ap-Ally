// src/lib/rag-service.ts

import { TextbookIngestionService, PineconeMetadata } from './textbook-ingestion';

export interface RAGContext {
  chunks: Array<{
    text: string;
    score: number;
    source: string;
    metadata: PineconeMetadata;
  }>;
  citations: Citation[];
}

export interface Citation {
  id: string;
  course: string;
  chunkIndex: number;
  text: string;
  relevanceScore: number;
}

export interface RAGQuery {
  query: string;
  courseName?: string;
  topK?: number;
  minRelevanceScore?: number;
}

export class RAGService {
  private ingestionService: TextbookIngestionService;

  constructor() {
    this.ingestionService = new TextbookIngestionService();
  }

  async retrieveContext(query: RAGQuery): Promise<RAGContext> {
    const {
      query: queryText,
      courseName,
      topK = 5,
      minRelevanceScore = 0.5
    } = query;


    const results = await this.ingestionService.searchSimilarChunks(
      queryText,
      courseName,
      topK
    );


    const filteredResults = results.filter(
      result => result.score >= minRelevanceScore
    );


    const chunks = filteredResults.map((result, index) => ({
      text: result.text,
      score: result.score,
      source: `${result.metadata.course} - Chunk ${result.metadata.chunk}`,
      metadata: result.metadata
    }));

    const citations = filteredResults.map((result, index) => ({
      id: `ref-${index + 1}`,
      course: result.metadata.course,
      chunkIndex: result.metadata.chunk,
      text: result.text.substring(0, 200) + (result.text.length > 200 ? '...' : ''),
      relevanceScore: result.score
    }));


    return { chunks, citations };
  }

  formatContextForPrompt(context: RAGContext): string {
    if (context.chunks.length === 0) {
      return 'No relevant textbook content found.';
    }

    const contextText = context.chunks
      .map((chunk, index) => {
        const citationId = context.citations[index]?.id || `ref-${index + 1}`;
        return `[${citationId}] ${chunk.text}`;
      })
      .join('\n\n');

    return `**Relevant Textbook Content:**\n${contextText}`;
  }

  formatCitationsForResponse(citations: Citation[]): string {
    if (citations.length === 0) {
      return '';
    }

    const citationsText = citations
      .map(citation => 
        `${citation.id}: ${citation.course}, Section ${citation.chunkIndex} (Relevance: ${citation.relevanceScore.toFixed(2)})`
      )
      .join('\n');

    return `\n\n**Sources:**\n${citationsText}`;
  }

  async enhanceLessonPrompt(
    originalPrompt: string,
    topic: string,
    apSubject?: string
  ): Promise<{ enhancedPrompt: string; citations: Citation[] }> {

    const context = await this.retrieveContext({
      query: topic,
      courseName: apSubject,
      topK: 5,
      minRelevanceScore: 0.5
    });

    if (context.chunks.length === 0) {
      return {
        enhancedPrompt: originalPrompt,
        citations: []
      };
    }

    const contextSection = this.formatContextForPrompt(context);
    
    const enhancedPrompt = `${originalPrompt}

${contextSection}

**Instructions for using textbook content:**
- Use the provided textbook content as the primary source of truth
- Ensure all facts and concepts align with the textbook material
- Include relevant citations using the reference IDs [ref-1], [ref-2], etc.
- If textbook content conflicts with general knowledge, prioritize the textbook
- Supplement textbook content with additional explanations when helpful`;


    return {
      enhancedPrompt,
      citations: context.citations
    };
  }

  async enhanceRoadmapPrompt(
    originalPrompt: string,
    apCourse: string
  ): Promise<{ enhancedPrompt: string; citations: Citation[] }> {

    // Try multiple query strategies to find relevant content
    const queryStrategies = [
      // Strategy 1: Just the course name (most likely to match your data)
      apCourse,
      // Strategy 2: Extract key terms from course name
      this.extractCourseKeywords(apCourse),
      // Strategy 3: Generic curriculum terms with course
      `${apCourse} units chapters topics`,
      // Strategy 4: Just the subject area
      apCourse.replace(/^AP\s+/, '').replace(/:.*$/, '').trim()
    ];

    let bestContext: RAGContext = { chunks: [], citations: [] };
    let bestQuery = '';

    for (const query of queryStrategies) {
      const context = await this.retrieveContext({
        query,
        courseName: apCourse,
        topK: 7,
        minRelevanceScore: 0.3 // Even more permissive for roadmaps
      });

      if (context.chunks.length > bestContext.chunks.length) {
        bestContext = context;
        bestQuery = query;
      }

      // If we found good results, don't try more strategies
      if (context.chunks.length >= 3) {
        break;
      }
    }

    if (bestContext.chunks.length === 0) {
      return {
        enhancedPrompt: originalPrompt,
        citations: []
      };
    }

    const contextSection = this.formatContextForPrompt(bestContext);
    
    const enhancedPrompt = `${originalPrompt}

${contextSection}

**Instructions for using course structure information:**
- Base the roadmap units and topics on the provided textbook curriculum
- Ensure lesson sequencing follows the textbook's recommended order
- Use textbook terminology and concept naming conventions
- Reference specific textbook sections when creating lessons`;


    return {
      enhancedPrompt,
      citations: bestContext.citations
    };
  }

  private extractCourseKeywords(apCourse: string): string {
    // Extract key terms from course names like "AP World History: Modern"
    return apCourse
      .replace(/^AP\s+/, '') // Remove "AP" prefix
      .replace(/:.*$/, '')   // Remove subtitle after colon
      .trim();
  }
}