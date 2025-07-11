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
  type: z.string().describe('Question type: mcq'),
  question: z.string().describe('The question text'),
  options: z.array(z.string()).describe('Four multiple choice options labeled A, B, C, D'),
  correctAnswer: z.string().describe('The correct answer (A, B, C, or D)'),
  explanation: z.string().describe('Detailed explanation referencing AP concepts and why other options are incorrect'),
  unit: z.string().describe('The unit this question covers'),
  difficulty: z.string().describe('Question difficulty level'),
  skillCategory: z.string().describe('AP skill category being tested'),
  stimulus: z.string().optional().describe('Optional stimulus material (quote, chart description, etc.)'),
});

const LEQQuestionSchema = z.object({
  type: z.string().describe('Question type: leq'),
  prompt: z.string().describe('The essay prompt'),
  timeLimit: z.number().describe('Recommended time limit in minutes'),
  points: z.number().describe('Total points possible'),
  rubric: z.object({
    thesis: z.object({
      points: z.number().describe('Points possible for thesis'),
      criteria: z.string().describe('Specific criteria for earning thesis points'),
    }),
    evidence: z.object({
      points: z.number().describe('Points possible for evidence'),
      criteria: z.string().describe('Specific criteria for earning evidence points'),
    }),
    analysis: z.object({
      points: z.number().describe('Points possible for analysis'),
      criteria: z.string().describe('Specific criteria for earning analysis points'),
    }),
    complexity: z.object({
      points: z.number().describe('Points possible for complexity'),
      criteria: z.string().describe('Specific criteria for earning complexity points'),
    }),
  }).describe('Official AP LEQ rubric breakdown'),
  unit: z.string().describe('The unit this question covers'),
  difficulty: z.string().describe('Question difficulty level'),
  skillCategory: z.string().describe('AP skill category being tested'),
});

const LAQQuestionSchema = z.object({
  type: z.string().describe('Question type: laq'),
  prompt: z.string().describe('The main question prompt'),
  timeLimit: z.number().describe('Recommended time limit in minutes'),
  points: z.number().describe('Total points possible'),
  parts: z.array(z.object({
    letter: z.string().describe('Part letter (a, b, c, etc.)'),
    question: z.string().describe('The specific question for this part'),
    points: z.number().describe('Points for this part'),
    sampleResponse: z.string().describe('Key points for a strong response'),
  })).describe('Question parts in AP SAQ format'),
  unit: z.string().describe('The unit this question covers'),
  difficulty: z.string().describe('Question difficulty level'),
  skillCategory: z.string().describe('AP skill category being tested'),
  stimulus: z.string().optional().describe('Optional stimulus material'),
});

const PracticeQuizOutputSchema = z.object({
  title: z.string().describe('Title of the practice quiz'),
  format: z.string().describe('Quiz format'),
  totalQuestions: z.number().describe('Total number of questions'),
  estimatedTime: z.number().describe('Estimated completion time in minutes'),
  instructions: z.string().describe('Instructions for taking the quiz'),
  questions: z.array(z.object({
    type: z.string().describe('Question type (mcq, leq, or laq)'),
    question: z.string().optional().describe('The question text for MCQ'),
    prompt: z.string().optional().describe('The prompt for LEQ/LAQ'),
    options: z.array(z.string()).optional().describe('MCQ options'),
    correctAnswer: z.string().optional().describe('MCQ correct answer'),
    explanation: z.string().optional().describe('MCQ explanation'),
    timeLimit: z.number().optional().describe('Time limit in minutes'),
    points: z.number().optional().describe('Points possible'),
    rubric: z.object({
      thesis: z.object({
        points: z.number(),
        criteria: z.string(),
      }).optional(),
      evidence: z.object({
        points: z.number(),
        criteria: z.string(),
      }).optional(),
      analysis: z.object({
        points: z.number(),
        criteria: z.string(),
      }).optional(),
      complexity: z.object({
        points: z.number(),
        criteria: z.string(),
      }).optional(),
    }).optional().describe('LEQ rubric'),
    parts: z.array(z.object({
      letter: z.string(),
      question: z.string(),
      points: z.number(),
      sampleResponse: z.string(),
    })).optional().describe('LAQ parts'),
    unit: z.string().describe('The unit this question covers'),
    difficulty: z.string().describe('Question difficulty level'),
    skillCategory: z.string().describe('AP skill category being tested'),
    stimulus: z.string().optional().describe('Optional stimulus material'),
  })).describe('Array of quiz questions'),
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
      output: { format: 'json' },
      prompt: `You are an expert AP exam creator who follows the official College Board AP exam format and rubrics exactly. Generate a practice quiz that strictly adheres to AP exam standards.

AP Course: {{{apCourse}}}
Format: {{{format}}}
Units to Cover: {{{units}}}
Number of Questions: {{{questionCount}}}
Difficulty Level: {{{difficulty}}}

CRITICAL AP FORMATTING REQUIREMENTS:

1. **Multiple Choice Questions (MCQ)**:
   - Set type field to "mcq"
   - Exact AP exam format with 4 options (A, B, C, D)
   - Test AP skills: Knowledge/Understanding, Application, Analysis/Synthesis
   - Include stimulus materials when appropriate (excerpts, charts, images)
   - Distractors must be plausible but clearly incorrect
   - Questions should mirror actual AP exam style and complexity
   - Include detailed explanations referencing specific AP concepts

2. **Long Essay Questions (LEQ)**:
   - Set type field to "leq"
   - Follow official AP LEQ rubric exactly:
     * Thesis/Claim (0-1 point): Must answer the prompt with a defensible thesis
     * Evidence (0-2 points): Must provide specific historical evidence
     * Analysis and Reasoning (0-2 points): Must use evidence to support argument
     * Complexity (0-1 point): Must demonstrate sophisticated understanding
   - Time limit: 40 minutes for AP History, 45 minutes for AP English
   - Provide authentic historical prompts that require comparison, causation, continuity/change
   - Include specific rubric details for each point category

3. **Long Answer Questions (LAQ/SAQ)**:
   - Set type field to "laq"
   - Follow AP Short Answer Question format exactly
   - Usually 3 parts (a, b, c) each worth 1 point
   - Time limit: 15 minutes total
   - Require specific historical evidence and analysis
   - Use authentic AP command terms: "Identify," "Explain," "Describe"
   - Include stimulus materials when appropriate

4. **Content Standards**:
   - Must align with official AP Course and Exam Description
   - Cover specified units with authentic content
   - Use proper AP command terms and academic language
   - Reference real historical events, concepts, and examples
   - Match authentic AP exam difficulty and complexity

5. **Rubric Details**:
   - Provide complete rubric breakdown for each question type
   - Include specific point allocations and requirements
   - Reference AP scoring guidelines terminology
   - Give clear criteria for each achievement level

Generate questions that are indistinguishable from actual AP exam questions. Include comprehensive explanations that help students understand AP expectations and scoring criteria.

REQUIRED OUTPUT FORMAT:
You MUST include ALL of these fields in your response:
- title: A descriptive title for the practice quiz (e.g., "AP History Unit 1-3 Practice Quiz")
- format: The quiz format (mcq, leq, laq, or mixed)
- totalQuestions: The exact number of questions generated
- estimatedTime: Estimated completion time in minutes
- instructions: Clear instructions for taking the quiz
- questions: Array of question objects with all required fields

For MCQ questions, you MUST include these exact fields:
- type: "mcq"
- question: The question text
- options: Array of exactly 4 answer choices (e.g., ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"])
- correctAnswer: The correct answer (must match one of the options exactly)
- explanation: Detailed explanation of why the answer is correct
- unit: The unit this question covers
- difficulty: Question difficulty level
- skillCategory: AP skill category being tested
- stimulus: Optional stimulus material (can be empty string if not needed)

Example MCQ format:
{
  "type": "mcq",
  "question": "What is the limit of f(x) = x² as x approaches 2?",
  "options": ["A. 2", "B. 4", "C. 6", "D. 8"],
  "correctAnswer": "B. 4",
  "explanation": "The limit of x² as x approaches 2 is 2² = 4.",
  "unit": "Limits and Continuity",
  "difficulty": "medium",
  "skillCategory": "Application",
  "stimulus": ""
}

Ensure your JSON output is complete and valid according to the schema.`,
    });

    const flow = ai.defineFlow({
      name: 'generatePracticeQuizFlow',
      inputSchema: PracticeQuizRequestSchema,
      outputSchema: z.any(), // Remove strict validation, handle in code
    }, async (input) => {
      const { output } = await prompt(input);
      
      // Ensure all required fields are present
      if (!output) {
        throw new Error('No output generated');
      }
      
      // Parse the output if it's a string
      let parsedOutput = output;
      if (typeof output === 'string') {
        try {
          parsedOutput = JSON.parse(output);
        } catch (e) {
          console.error('Failed to parse JSON output:', output);
          throw new Error('Invalid JSON output from AI');
        }
      }
      
      // Process questions to ensure they have all required fields
      const processedQuestions = (parsedOutput.questions || []).map((question: any, index: number) => {
        const baseQuestion = {
          type: question.type || 'mcq',
          unit: question.unit || 'General',
          difficulty: question.difficulty || 'medium',
          skillCategory: question.skillCategory || 'Knowledge/Understanding',
          stimulus: question.stimulus || '',
        };

        if (question.type === 'mcq' || !question.type) {
          return {
            ...baseQuestion,
            question: question.question || `Question ${index + 1}`,
            options: question.options || ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4'],
            correctAnswer: question.correctAnswer || 'A. Option 1',
            explanation: question.explanation || 'Explanation not provided.',
          };
        }

        return { ...baseQuestion, ...question };
      });

      // Add missing required fields with defaults if necessary
      const result = {
        title: parsedOutput.title || `AP ${input.apCourse} Practice Quiz`,
        format: parsedOutput.format || input.format,
        totalQuestions: parsedOutput.totalQuestions || processedQuestions.length || input.questionCount,
        estimatedTime: parsedOutput.estimatedTime || (input.questionCount * 2), // 2 minutes per question as default
        instructions: parsedOutput.instructions || 'Complete the following questions to the best of your ability.',
        questions: processedQuestions,
      };
      
      // Validate the result manually
      const validationResult = PracticeQuizOutputSchema.safeParse(result);
      if (!validationResult.success) {
        console.error('Validation failed:', validationResult.error);
        console.error('Result data:', result);
        throw new Error('Generated quiz does not match expected format');
      }
      
      return result;
    });

    const result = await flow(parseResult.data);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to generate practice quiz:', error);
    return NextResponse.json({ error: 'Failed to generate practice quiz' }, { status: 500 });
  }
}

export const POST = await withAuth(generatePracticeQuizHandler);