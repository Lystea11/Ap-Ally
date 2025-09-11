'use server';

/**
 * @fileOverview Generates a personalized study roadmap based on user input.
 *
 * - generateRoadmap - A function that generates a study roadmap.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { withAIResilience } from '@/lib/ai-resilience';
import { RAGService } from '@/lib/rag-service';

const GenerateRoadmapInputSchema = z.object({
  apCourse: z.string().describe('The AP course the student is studying for.'),
  quizResults: z.string().describe('The detailed results of the unit-specific diagnostic quiz including which questions were correct/incorrect and what units/skills they covered.'),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const LessonSchema = z.object({
  title: z.string().describe('The title of the lesson.'),
});

const UnitSchema = z.object({
  title: z.string().describe('The title of the unit.'),
  lessons: z.array(LessonSchema).describe('A list of lessons in this unit.'),
});

const RoadmapSchema = z.object({
  title: z.string().describe("The title for the overall study roadmap."),
  units: z.array(UnitSchema).describe('A list of units, each containing lessons.'),
});

const GenerateRoadmapOutputSchema = z.object({
  roadmap: RoadmapSchema,
  progress: z.string().describe('One-sentence summary of what has been generated.'),
  citations: z.array(z.object({
    id: z.string(),
    course: z.string(),
    chunkIndex: z.number(),
    text: z.string(),
    relevanceScore: z.number()
  })).optional().describe('Citations from textbook content used in the roadmap.')
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return withAIResilience(
    () => generateRoadmapFlow(input),
    {
      priority: 'high',
      timeout: 200000, // 3.33 minutes for roadmap generation
      fallbackModel: 'googleai/gemini-1.5-flash'
    }
  );
}

const promptSchema = z.object({
  apCourse: z.string(),
  quizResults: z.string(),
  textbookContext: z.string().optional()
});

const prompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: {schema: promptSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert AP study guide creator. Based on the student's AP course and detailed diagnostic quiz results, generate a personalized study roadmap that focuses on their specific strengths and weaknesses.

  AP Course: {{{apCourse}}}
  Diagnostic Quiz Results: {{{quizResults}}}

{{{textbookContext}}}

Analyze the quiz results to identify:
1. Units/topics where the student performed well (can be reviewed more quickly)
2. Units/topics where the student struggled (need more intensive study)
3. Specific skills that need development
4. Foundational concepts that may need reinforcement

Create a personalized roadmap that:
- Prioritizes areas of weakness with more lessons and practice
- Includes lighter review for areas of strength
- Sequences topics logically building from foundations
- Adapts lesson depth based on demonstrated knowledge
- Focuses on skills the student needs to develop

The roadmap should have a title (the AP course name), units, and lessons within each unit. Tailor the content and pacing to the student's specific diagnostic results.
`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    // Get RAG context for course structure
    const ragService = new RAGService();
    const ragResult = await ragService.enhanceRoadmapPrompt(
      '', // We'll use the enhanced prompt directly
      input.apCourse
    );

    const textbookContext = ragResult.citations.length > 0 
      ? ragService.formatContextForPrompt({ chunks: [], citations: ragResult.citations })
      : '';


    const {output} = await prompt({
      apCourse: input.apCourse,
      quizResults: input.quizResults,
      textbookContext
    });
    
    return {
      roadmap: output!.roadmap,
      progress: "Generated a personalized study roadmap based on the student's AP course and diagnostic quiz results.",
      citations: ragResult.citations
    };
  }
);