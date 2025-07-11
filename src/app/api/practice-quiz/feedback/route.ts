import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { z } from 'zod';
import { ai } from '@/ai/genkit';

const FeedbackRequestSchema = z.object({
  apCourse: z.string().describe('The AP course name'),
  quizData: z.object({
    title: z.string(),
    format: z.string(),
    questions: z.array(z.any()),
  }).describe('The quiz data'),
  answers: z.record(z.string()).describe('User answers mapped by question index'),
});

type FeedbackRequest = z.infer<typeof FeedbackRequestSchema>;

const FeedbackResponseSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('Overall percentage score'),
  totalQuestions: z.number().describe('Total number of questions'),
  correctAnswers: z.number().describe('Number of correct answers'),
  strengths: z.array(z.string()).describe('Areas where the student performed well'),
  weaknesses: z.array(z.string()).describe('Areas where the student needs improvement'),
  improvementSuggestions: z.array(z.object({
    area: z.string().describe('The specific area that needs improvement'),
    suggestion: z.string().describe('Specific suggestion for improvement'),
    resources: z.array(z.string()).describe('Recommended resources or study strategies'),
  })).describe('Detailed improvement suggestions'),
  questionFeedback: z.array(z.object({
    questionIndex: z.number().describe('The question index'),
    isCorrect: z.boolean().describe('Whether the answer was correct'),
    correctAnswer: z.string().describe('The correct answer'),
    explanation: z.string().describe('Detailed explanation of the correct answer'),
    rubricFeedback: z.string().optional().describe('Specific rubric-based feedback for essay questions'),
  })).describe('Individual question feedback'),
});

type FeedbackResponse = z.infer<typeof FeedbackResponseSchema>;

async function generateFeedbackHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const body = await req.json();

  const parseResult = FeedbackRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parseResult.error.flatten() }, { status: 400 });
  }

  const { apCourse, quizData, answers } = parseResult.data;

  try {
    const prompt = ai.definePrompt({
      name: 'generateQuizFeedbackPrompt',
      input: { schema: FeedbackRequestSchema },
      output: { schema: FeedbackResponseSchema },
      prompt: `You are an expert AP tutor providing detailed feedback on a student's quiz performance. Analyze the student's answers and provide comprehensive feedback that follows AP standards and rubrics.

AP Course: {{{apCourse}}}
Quiz Title: {{{quizData.title}}}
Quiz Format: {{{quizData.format}}}
Questions: {{{quizData.questions}}}
Student Answers: {{{answers}}}

FEEDBACK REQUIREMENTS:

1. **Scoring Analysis**:
   - Calculate accurate percentage score based on correct answers
   - For MCQ: 1 point per correct answer
   - For LEQ: Use official AP rubric scoring (typically 6 points total)
   - For LAQ/SAQ: Score based on individual parts (typically 1 point per part)

2. **Strengths Identification**:
   - Identify specific AP skills the student demonstrated well
   - Reference specific questions where they excelled
   - Highlight understanding of AP concepts and content

3. **Weaknesses Analysis**:
   - Identify specific areas where the student struggled
   - Reference College Board rubrics and standards
   - Focus on AP-specific skills and content gaps

4. **Improvement Suggestions**:
   - Provide specific, actionable recommendations
   - Reference official AP resources and strategies
   - Suggest targeted practice activities
   - Include study techniques appropriate for the AP level

5. **Question-by-Question Feedback**:
   - For MCQ: Explain why the correct answer is right and why incorrect options are wrong
   - For LEQ: Provide rubric-based feedback on thesis, evidence, analysis, and complexity
   - For LAQ: Give specific feedback on each part of the question
   - Reference AP scoring guidelines and standards

6. **College Board Alignment**:
   - Use official AP terminology and concepts
   - Reference specific rubric criteria
   - Align feedback with AP course standards
   - Provide guidance that prepares students for the actual AP exam

Make the feedback constructive, specific, and focused on helping the student improve their AP exam performance. Reference specific College Board rubrics and standards throughout.`,
    });

    const flow = ai.defineFlow({
      name: 'generateQuizFeedbackFlow',
      inputSchema: FeedbackRequestSchema,
      outputSchema: FeedbackResponseSchema,
    }, async (input) => {
      const { output } = await prompt(input);
      return output!;
    });

    const result = await flow(parseResult.data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to generate quiz feedback:', error);
    return NextResponse.json({ error: 'Failed to generate quiz feedback' }, { status: 500 });
  }
}

export const POST = await withAuth(generateFeedbackHandler);