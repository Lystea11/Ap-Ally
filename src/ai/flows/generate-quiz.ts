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
import { withAIResilience } from '@/lib/ai-resilience';

const GenerateQuizInputSchema = z.object({
  apCourse: z.string().describe('The name of the AP course.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z.array(z.object({
    question: z.string().describe('The text of the quiz question.'),
    options: z.array(z.string()).describe('An array of 4 multiple choice options.'),
    correct_answer: z.string().describe('The correct answer from the options array.'),
    unit: z.string().describe('The unit/topic this question assesses.'),
    skill: z.string().describe('The specific skill or concept being tested.'),
  })).describe('An array of 8-12 quiz questions covering different units and skills.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return withAIResilience(
    () => generateQuizFlow(input),
    {
      priority: 'high',
      timeout: 180000, // 3 minutes for quiz generation
      fallbackModel: 'googleai/gemini-1.5-flash' // Fallback to lighter model
    }
  );
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert AP tutor. Generate a comprehensive diagnostic quiz with 8-12 multiple choice questions to assess the student's knowledge across different units and skills in the AP course. This quiz should cover the major topics and skills that will be tested on the AP exam.

  AP Course: {{{apCourse}}}

  Create questions that:
  1. Cover different units/topics from the AP curriculum
  2. Test various skills (knowledge, analysis, application, synthesis)
  3. Range from foundational to advanced concepts
  4. Are appropriate for the AP level
  5. Each question should clearly indicate which unit/topic and skill it assesses
  6. Use LaTeX formatting for all mathematical expressions, equations, and formulas:
     - Inline math: Use single dollar signs $E=mc^2$ for expressions within text
     - Block math: Use double dollar signs $$\\frac{d}{dx}[f(x)] = f'(x)$$ for standalone equations
     - Scientific notation: Use LaTeX format $6.022 \\times 10^{23}$ instead of 6.022e23
     - Fractions: Use \\frac{numerator}{denominator} format like $\\frac{1}{2}$
     - Subscripts and superscripts: Use _{subscript} and ^{superscript} like $H_2O$ and $x^2$
     - Greek letters: Use LaTeX commands like $\\alpha$, $\\beta$, $\\pi$, $\\Delta$
     - Special symbols: Use LaTeX commands like $\\infty$, $\\sum$, $\\int$, $\\sqrt{x}$
     - Chemical formulas: Use LaTeX format $CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O$

  For each question, provide:
  - A clear, well-written question
  - 4 multiple choice options with one correct answer
  - The correct answer (exactly as it appears in the options array)
  - The specific unit/topic it covers
  - The skill or concept being tested

  This diagnostic will help create a personalized study plan based on the student's strengths and weaknesses across different areas.
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
