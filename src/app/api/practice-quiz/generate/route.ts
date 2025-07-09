import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { z } from 'zod';
import { ai } from '@/ai/genkit';

const PracticeQuizRequestSchema = z.object({
  apCourse: z.string().describe('The AP course name'),
  format: z.enum(['mcq', 'leq', 'laq', 'mixed']).describe('The quiz format type'),
  units: z.array(z.string()).describe('Selected units for the quiz'),
  questionCount: z.number().min(1).max(50).describe('Number of questions to generate'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).describe('Difficulty level'),
});

type PracticeQuizRequest = z.infer<typeof PracticeQuizRequestSchema>;

const MCQQuestionSchema = z.object({
  type: z.literal('mcq'),
  question: z.string().describe('The question text'),
  options: z.array(z.string()).describe('Four multiple choice options'),
  correctAnswer: z.string().describe('The correct answer'),
  explanation: z.string().describe('Explanation of why the answer is correct'),
  unit: z.string().describe('The unit this question covers'),
  difficulty: z.string().describe('Question difficulty level'),
});

const LEQQuestionSchema = z.object({
  type: z.literal('leq'),
  prompt: z.string().describe('The essay prompt'),
  timeLimit: z.number().describe('Recommended time limit in minutes'),
  points: z.number().describe('Total points possible'),
  rubric: z.object({
    thesis: z.string().describe('Thesis/claim requirements'),
    evidence: z.string().describe('Evidence requirements'),
    analysis: z.string().describe('Analysis and reasoning requirements'),
    synthesis: z.string().describe('Synthesis/complexity requirements'),
  }).describe('AP-style rubric breakdown'),
  unit: z.string().describe('The unit this question covers'),
  difficulty: z.string().describe('Question difficulty level'),
});

const LAQQuestionSchema = z.object({
  type: z.literal('laq'),
  prompt: z.string().describe('The question prompt'),
  timeLimit: z.number().describe('Recommended time limit in minutes'),
  points: z.number().describe('Total points possible'),
  requirements: z.array(z.string()).describe('Specific requirements for the answer'),
  sampleResponse: z.string().describe('Key points that should be included in a strong response'),
  unit: z.string().describe('The unit this question covers'),
  difficulty: z.string().describe('Question difficulty level'),
});

const PracticeQuizOutputSchema = z.object({
  title: z.string().describe('Title of the practice quiz'),
  format: z.string().describe('Quiz format'),
  totalQuestions: z.number().describe('Total number of questions'),
  estimatedTime: z.number().describe('Estimated completion time in minutes'),
  instructions: z.string().describe('Instructions for taking the quiz'),
  questions: z.array(z.union([MCQQuestionSchema, LEQQuestionSchema, LAQQuestionSchema])),
});

type PracticeQuizOutput = z.infer<typeof PracticeQuizOutputSchema>;

async function generatePracticeQuizHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const body = await req.json();

  const parseResult = PracticeQuizRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parseResult.error.flatten() }, { status: 400 });
  }

  const { apCourse, format, units, questionCount, difficulty } = parseResult.data;

  try {
    const prompt = ai.definePrompt({
      name: 'generatePracticeQuizPrompt',
      input: { schema: PracticeQuizRequestSchema },
      output: { schema: PracticeQuizOutputSchema },
      prompt: `You are an expert AP exam creator. Generate a practice quiz that strictly follows AP exam format, style, and rubrics.

AP Course: {{{apCourse}}}
Format: {{{format}}}
Units to Cover: {{{units}}}
Number of Questions: {{{questionCount}}}
Difficulty Level: {{{difficulty}}}

CRITICAL REQUIREMENTS:

1. **Multiple Choice Questions (MCQ)**:
   - Follow exact AP exam format
   - 4 options labeled A, B, C, D
   - Questions test specific AP skills: analysis, interpretation, application
   - Include stimulus materials when appropriate (charts, passages, etc.)
   - Distractors should be plausible but clearly incorrect

2. **Long Essay Questions (LEQ)**:
   - Follow official AP LEQ format and rubrics
   - Include specific time limits (typically 40-45 minutes)
   - Provide detailed rubric with point breakdown:
     * Thesis/Claim (1 point)
     * Evidence (2-3 points) 
     * Analysis and Reasoning (2 points)
     * Complexity/Synthesis (1 point)
   - Prompts should require historical thinking skills

3. **Long Answer Questions (LAQ)**:
   - Follow AP SAQ/LAQ format
   - Typically 3-4 parts (a, b, c, d)
   - Each part worth specific points
   - Time limit usually 10-15 minutes
   - Require specific evidence and analysis

4. **Content Standards**:
   - Questions must align with official AP curriculum
   - Cover specified units accurately
   - Use appropriate AP command terms (analyze, evaluate, compare, etc.)
   - Reference authentic historical examples and concepts
   - Match specified difficulty level

5. **Format Mixing** (if mixed format selected):
   - Distribute questions proportionally
   - Maintain authentic AP exam structure
   - Provide appropriate time allocations

Generate questions that could realistically appear on an actual AP exam. Include detailed explanations and rubrics that help students understand AP expectations.`,
    });

    const flow = ai.defineFlow({
      name: 'generatePracticeQuizFlow',
      inputSchema: PracticeQuizRequestSchema,
      outputSchema: PracticeQuizOutputSchema,
    }, async (input) => {
      const { output } = await prompt(input);
      return output!;
    });

    const result = await flow(parseResult.data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to generate practice quiz:', error);
    return NextResponse.json({ error: 'Failed to generate practice quiz' }, { status: 500 });
  }
}

export const POST = await withAuth(generatePracticeQuizHandler);