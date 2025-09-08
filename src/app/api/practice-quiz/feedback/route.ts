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
  overallScore: z.number().min(0).max(100).describe('Overall percentage score - MUST be mathematically accurate'),
  totalQuestions: z.number().describe('Total number of questions'),
  correctAnswers: z.number().describe('Total points earned across all questions'),
  strengths: z.array(z.string()).min(1).max(3).describe('Specific areas where student performed well (1-3 items)'),
  weaknesses: z.array(z.string()).min(1).max(3).describe('Specific areas needing improvement (1-3 items)'),
  improvementSuggestions: z.array(z.object({
    area: z.string().describe('The specific area that needs improvement'),
    suggestion: z.string().describe('Specific suggestion for improvement'),
    resources: z.array(z.string()).describe('Recommended resources or study strategies'),
  })).min(1).max(3).describe('Targeted improvement suggestions (1-3 items)'),
  questionFeedback: z.array(z.object({
    questionIndex: z.number().describe('The question index'),
    isCorrect: z.boolean().describe('Whether the answer earned full points'),
    correctAnswer: z.string().describe('Points earned vs. points possible (e.g., "4/6 points")'),
    explanation: z.string().describe('Detailed rubric-based explanation of scoring'),
    rubricFeedback: z.string().describe('Specific rubric criteria analysis for this question'),
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
      prompt: `You are an expert AP grader following official College Board rubrics. Grade each question carefully and provide detailed feedback.

AP Course: {{{apCourse}}}
Quiz Title: {{{quizData.title}}}
Quiz Format: {{{quizData.format}}}
Questions: {{{quizData.questions}}}
Student Answers: {{{answers}}}

CRITICAL GRADING INSTRUCTIONS:

1. **ACCURATE SCORING**:
   - Grade each question individually using official AP rubrics
   - For LEQ (6 points total): Thesis (1pt), Evidence (2pts), Analysis (2pts), Complexity (1pt)
   - For LAQ/SAQ: Grade each part separately (typically 1pt per part)
   - Calculate overall percentage: (total points earned / total points possible) × 100
   - BE MATHEMATICALLY PRECISE - your score MUST match your individual question assessments

2. **QUESTION-BY-QUESTION ANALYSIS** (REQUIRED):
   You MUST provide feedback for EVERY question in the quiz. For each question (indexed 0, 1, 2, etc.), provide:
   - Exact points earned vs. points possible
   - Specific rubric criteria met or missed
   - Detailed explanation of what the student did well/poorly
   - Specific suggestions for improvement
   - The questionIndex must match the question's position in the array (0-based)

3. **CONSISTENT FEEDBACK**:
   - Number of strengths should reflect good performance areas
   - Number of weaknesses should reflect poor performance areas
   - If student scored 66% (2/3), show roughly equal strengths and weaknesses
   - Improvement suggestions should directly address identified weaknesses

4. **RUBRIC-BASED GRADING**:
   
   **For LEQ Questions:**
   - Thesis (1pt): Does the response include a defensible thesis that answers the prompt?
   - Evidence (2pts): Does the response provide specific historical evidence? (1pt for some, 2pts for substantial)
   - Analysis (2pts): Does the response use evidence to support the argument? (1pt for some, 2pts for effective)
   - Complexity (1pt): Does the response demonstrate sophisticated understanding?
   
   **For LAQ/SAQ Questions:**
   - Grade each part (a, b, c) separately based on accuracy and completeness
   - 1 point per part if the response adequately addresses the prompt
   - 0 points if the response is incorrect, irrelevant, or missing

5. **MATHEMATICAL CONSISTENCY**:
   - Count total points earned across all questions
   - Count total points possible across all questions  
   - Overall score = (earned/possible) × 100
   - Ensure your strengths/weaknesses align with this score
   - If score is low, focus on what went wrong; if high, focus on what went right

6. **SPECIFIC FEEDBACK REQUIREMENTS**:
   - Reference the student's actual written responses
   - Quote specific parts of their answers when giving feedback
   - Explain exactly what AP rubric criteria were met or missed
   - Provide concrete steps for improvement based on official AP standards

REMEMBER: Your scoring must be mathematically accurate and your feedback must directly correspond to the calculated score. No contradictions between overall score and individual assessments.

CRITICAL: You MUST provide questionFeedback for EVERY question in the quiz. If there are 3 questions, provide exactly 3 questionFeedback objects with questionIndex values 0, 1, and 2.`,
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