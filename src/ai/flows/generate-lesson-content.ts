// src/ai/flows/generate-lesson-content.ts
'use server';

/**
 * @fileOverview Generates lesson content with practice questions for a given topic.
 *
 * - generateLessonContent - A function that generates lesson content.
 * - GenerateLessonContentInput - The input type for the generateLessonContent function.
 * - GenerateLessonContentOutput - The return type for the generateLessonContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonContentInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate lesson content.'),
});
export type GenerateLessonContentInput = z.infer<typeof GenerateLessonContentInputSchema>;

const GenerateLessonContentOutputSchema = z.object({
  content: z.string().describe('The generated lesson content.'),
  practiceQuestions: z.array(z.string()).describe('Practice questions for the lesson.'),
  progress: z.string().describe('A short summary of the generated content.'),
});
export type GenerateLessonContentOutput = z.infer<typeof GenerateLessonContentOutputSchema>;

export async function generateLessonContent(input: GenerateLessonContentInput): Promise<GenerateLessonContentOutput> {
  return generateLessonContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonContentPrompt',
  input: {schema: GenerateLessonContentInputSchema},
  output: {schema: GenerateLessonContentOutputSchema},
  prompt: `You are an expert educator creating lesson content for AP level courses.
  Your goal is to teach the student the material and then provide practice questions to test their understanding.

  Topic: {{{topic}}}

  Create lesson content that thoroughly covers the topic. Include explanations, examples, and relevant details.
  Also, create a few practice questions that will help the student test their understanding of the material.
  Return the lesson content and practice questions in the output.  Also, add one short, one-sentence summary of what you have generated to the 'progress' field in the output.
  `,
});

const generateLessonContentFlow = ai.defineFlow(
  {
    name: 'generateLessonContentFlow',
    inputSchema: GenerateLessonContentInputSchema,
    outputSchema: GenerateLessonContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
