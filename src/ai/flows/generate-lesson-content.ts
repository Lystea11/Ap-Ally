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

const PracticeQuestionSchema = z.object({
  question: z.string().describe('The text of the practice question.'),
  options: z.array(z.string()).length(4).describe('An array of 4 multiple choice options.'),
  correctAnswerIndex: z.number().min(0).max(3).describe('The 0-based index of the correct answer in the options array.'),
  explanation: z.string().describe('A brief explanation for why the correct answer is correct.')
});

const GenerateLessonContentOutputSchema = z.object({
  content: z.string().describe('The generated lesson content in Markdown format. Should not include a main title or practice questions.'),
  practiceQuestions: z.array(PracticeQuestionSchema).length(5).describe('An array of exactly 5 interactive practice questions.'),
  progress: z.string().describe('A short, one-sentence summary describing the core concept of the lesson.'),
});
export type GenerateLessonContentOutput = z.infer<typeof GenerateLessonContentOutputSchema>;

export async function generateLessonContent(input: GenerateLessonContentInput): Promise<GenerateLessonContentOutput> {
  return generateLessonContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonContentPrompt',
  input: {schema: GenerateLessonContentInputSchema},
  output: {schema: GenerateLessonContentOutputSchema},
  prompt: `You are an expert educator creating lesson content for AP level courses. Your goal is to create a clear and concise lesson on a specific topic, along with interactive practice questions.

Topic: {{{topic}}}

**Instructions:**
1.  **Lesson Content ('content' field):**
    - Generate the main educational text for the lesson on the given topic.
    - **Do NOT include a title or a heading like 'Introduction' at the beginning of the content.** The title is already displayed separately. Start the lesson directly.
    - The content should be comprehensive, with clear explanations, examples, and relevant details.
    - Use Markdown for all formatting (subheadings, lists, bold text).
    - Use LaTeX syntax for mathematical equations (e.g., $E=mc^2$ for inline and $$...$$ for block equations).
    - **IMPORTANT**: Do NOT include the practice questions in this 'content' field.
2.  **Interactive Practice Questions ('practiceQuestions' field):**
    - Separately, create exactly 5 interactive practice questions to test the student's understanding.
    - For each question, provide:
      - The question text.
      - An array of exactly 4 multiple choice options.
      - The 0-based index of the correct answer.
      - A brief explanation of the correct answer.
3.  **Lesson Summary ('progress' field):**
    - Provide a short, one-sentence summary that describes the core concept of the lesson. For example: "This lesson covers the fundamental theorem of calculus."
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
