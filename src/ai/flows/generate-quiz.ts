'use server';

/**
 * @fileOverview Generates a personalized quiz based on the user's AP course and experience level.
 *
 * - generateQuiz - A function that generates the quiz.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  apCourse: z.string().describe('The name of the AP course.'),
  experienceLevel: z.string().describe('The experience level of the student (e.g., beginner, intermediate, advanced).'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z.array(z.object({
    question: z.string().describe('The text of the quiz question.'),
    options: z.array(z.string()).describe('An array of 4 multiple choice options.'),
  })).describe('An array of 3 to 5 quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert AP tutor. Generate a short quiz with 3-5 multiple choice questions to assess the student's current knowledge based on the selected AP course and experience level. For each question, provide 4 options.

  AP Course: {{{apCourse}}}
  Experience Level: {{{experienceLevel}}}
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
