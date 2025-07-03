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

const GenerateRoadmapInputSchema = z.object({
  apCourse: z.string().describe('The AP course the student is studying for.'),
  experienceLevel: z
    .string()
    .describe('The student’s experience level with the subject.'),
  quizResults: z.string().describe('The results of the initial quiz.'),
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
  progress: z.string().describe('One-sentence summary of what has been generated.')
});
export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are an expert AP study guide creator. Based on the student's AP course, experience level, and quiz results, generate a personalized study roadmap.

  AP Course: {{{apCourse}}}
  Experience Level: {{{experienceLevel}}}
  Quiz Results: {{{quizResults}}}

The roadmap should have a title, and include units, and each unit should include lessons. The title of the roadmap should be the name of the AP course.
`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      roadmap: output!.roadmap,
      progress: "Generated a personalized study roadmap based on the student's AP course, experience level, and quiz results."
    };
  }
);
