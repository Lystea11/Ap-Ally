'use server';

/**
 * @fileOverview Generates a personalized study roadmap based on user's custom description.
 *
 * - generateCustomRoadmap - A function that generates a study roadmap from user description.
 * - GenerateCustomRoadmapInput - The input type for the generateCustomRoadmap function.
 * - GenerateCustomRoadmapOutput - The return type for the generateCustomRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { withAIResilience } from '@/lib/ai-resilience';

const GenerateCustomRoadmapInputSchema = z.object({
  apCourse: z.string().describe('The AP course the student is studying for.'),
  customDescription: z.string().describe('The detailed description of what the student wants to study, provided in their own words.'),
});
export type GenerateCustomRoadmapInput = z.infer<typeof GenerateCustomRoadmapInputSchema>;

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

const GenerateCustomRoadmapOutputSchema = z.object({
  roadmap: RoadmapSchema,
  progress: z.string().describe('One-sentence summary of what has been generated.')
});
export type GenerateCustomRoadmapOutput = z.infer<typeof GenerateCustomRoadmapOutputSchema>;

export async function generateCustomRoadmap(input: GenerateCustomRoadmapInput): Promise<GenerateCustomRoadmapOutput> {
  return withAIResilience(
    () => generateCustomRoadmapFlow(input),
    {
      priority: 'high',
      timeout: 200000, // 3.33 minutes for roadmap generation
      fallbackModel: 'googleai/gemini-1.5-flash'
    }
  );
}

const prompt = ai.definePrompt({
  name: 'generateCustomRoadmapPrompt',
  input: {schema: GenerateCustomRoadmapInputSchema},
  output: {schema: GenerateCustomRoadmapOutputSchema},
  prompt: `You are an expert AP study guide creator. Based on the student's AP course and their specific description of what they want to study, generate a personalized study roadmap that addresses their stated learning goals and interests.

  AP Course: {{{apCourse}}}
  Student's Description: {{{customDescription}}}

Analyze the student's description to understand:
1. Their specific learning objectives and goals
2. Topics or units they want to focus on
3. Areas of particular interest or concern
4. Any specific skills they want to develop
5. Their current knowledge level (if indicated)

Create a personalized roadmap that:
- Directly addresses the topics and goals mentioned in their description
- Sequences content logically to build understanding
- Includes comprehensive coverage of their areas of interest
- Balances their stated preferences with essential AP course content
- Provides appropriate depth based on their indicated needs

The roadmap should have a title (the AP course name), units, and lessons within each unit. Tailor the content specifically to what the student has described they want to learn.

If the student's description is vague or doesn't specify particular areas, create a well-rounded roadmap that covers the essential topics of the AP course in a logical sequence.
`,
});

const generateCustomRoadmapFlow = ai.defineFlow(
  {
    name: 'generateCustomRoadmapFlow',
    inputSchema: GenerateCustomRoadmapInputSchema,
    outputSchema: GenerateCustomRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      roadmap: output!.roadmap,
      progress: "Generated a personalized study roadmap based on the student's custom description and AP course."
    };
  }
);