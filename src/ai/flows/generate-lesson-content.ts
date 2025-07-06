// src/ai/flows/generate-lesson-content.ts
'use server';

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

// New structured content schemas
const MarkdownContentSchema = z.object({
  type: z.enum(['markdown']),
  content: z.string(),
});

const TableContentSchema = z.object({
  type: z.enum(['table']),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

const DiagramContentSchema = z.object({
    type: z.enum(['diagram']),
    diagramType: z.enum(['mermaid']),
    code: z.string(),
});

const ContentBlockSchema = z.union([MarkdownContentSchema, TableContentSchema, DiagramContentSchema]);


const GenerateLessonContentOutputSchema = z.object({
  content: z.array(ContentBlockSchema).describe('An array of content blocks, which can be of type markdown, table, or diagram.'),
  practiceQuestions: z.array(PracticeQuestionSchema).length(5).describe('An array of exactly 5 interactive practice questions.'),
});
export type GenerateLessonContentOutput = z.infer<typeof GenerateLessonContentOutputSchema>;

export async function generateLessonContent(input: GenerateLessonContentInput): Promise<GenerateLessonContentOutput> {
  return generateLessonContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonContentPrompt',
  input: {schema: GenerateLessonContentInputSchema},
  output: {schema: GenerateLessonContentOutputSchema},
  prompt: `You are an expert educator creating lesson content for AP level courses. Your goal is to create a clear and structured lesson on a specific topic, along with interactive practice questions.

Topic: {{{topic}}}

**Instructions:**
1.  **Lesson Content ('content' field):**
    - Generate the lesson as an array of content blocks. Each block must have a 'type'.
    - For regular text, use \`{ "type": "markdown", "content": "..." }\`. Use Markdown for formatting (subheadings, lists, bold).
    - **For tables, use the JSON format:** \`{ "type": "table", "headers": ["Header 1", "Header 2"], "rows": [["Row 1 Col 1", "Row 1 Col 2"], ["Row 2 Col 1", "Row 2 Col 2"]] }\`. This is crucial for correct rendering.
    - **For diagrams, use the Mermaid format:** \`{ "type": "diagram", "diagramType": "mermaid", "code": "graph TD; A-->B;" }\`.
    - Use LaTeX for all mathematical equations (e.g., $E=mc^2$ or $$...$$). The rendering happens on the client, so do not use markdown tables for equations.
    - **IMPORTANT**: When generating complex content like Markdown tables that contain LaTeX, you MUST escape special characters to prevent rendering issues. For example, use '\\|' instead of '|' inside LaTeX equations within a table.
    - **IMPORTANT**: Do NOT include the practice questions in this 'content' field.
2.  **Practice Questions ('practiceQuestions' field):**
    - Separately, create exactly 5 interactive practice questions to test the student's understanding.
    - For each, provide:
      - The question text.
      - An array of exactly 4 multiple choice options.
      - The 0-based index of the correct answer.
      - A brief explanation of the correct answer.
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