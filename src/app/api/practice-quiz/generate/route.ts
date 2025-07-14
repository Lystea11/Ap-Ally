import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { withAIResilience } from '@/lib/ai-resilience';

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
  options: z.array(z.string()).describe('Four multiple choice options without labels'),
  correctAnswer: z.string().describe('The correct answer option text'),
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

// Updated schemas for flexible question validation
const MCQQuestionOutputSchema = z.object({
  type: z.literal('mcq'),
  question: z.string().describe('The question text'),
  options: z.array(z.string()).describe('MCQ options'),
  correctAnswer: z.string().describe('MCQ correct answer'),
  explanation: z.string().describe('MCQ explanation'),
  unit: z.string().describe('The unit this question covers'),
  difficulty: z.string().describe('Question difficulty level'),
  skillCategory: z.string().describe('AP skill category being tested'),
  stimulus: z.string().optional().describe('Optional stimulus material'),
});

const LEQQuestionOutputSchema = z.object({
  type: z.literal('leq'),
  prompt: z.string().describe('The essay prompt'),
  timeLimit: z.number().optional().describe('Time limit in minutes'),
  points: z.number().optional().describe('Points possible'),
  rubric: z.object({
    thesis: z.object({
      points: z.number(),
      criteria: z.string(),
    }),
    evidence: z.object({
      points: z.number(),
      criteria: z.string(),
    }),
    analysis: z.object({
      points: z.number(),
      criteria: z.string(),
    }),
    complexity: z.object({
      points: z.number(),
      criteria: z.string(),
    }),
  }).describe('LEQ rubric'),
  unit: z.string().describe('The unit this question covers'),
  difficulty: z.string().describe('Question difficulty level'),
  skillCategory: z.string().describe('AP skill category being tested'),
  stimulus: z.string().optional().describe('Optional stimulus material'),
});

const LAQQuestionOutputSchema = z.object({
  type: z.literal('laq'),
  prompt: z.string().describe('The main question prompt'),
  timeLimit: z.number().optional().describe('Time limit in minutes'),
  points: z.number().optional().describe('Points possible'),
  parts: z.array(z.object({
    letter: z.string(),
    question: z.string(),
    points: z.number(),
    sampleResponse: z.string(),
  })).describe('LAQ parts'),
  unit: z.string().describe('The unit this question covers'),
  difficulty: z.string().describe('Question difficulty level'),
  skillCategory: z.string().describe('AP skill category being tested'),
  stimulus: z.string().optional().describe('Optional stimulus material'),
});

const QuestionOutputSchema = z.discriminatedUnion('type', [
  MCQQuestionOutputSchema,
  LEQQuestionOutputSchema,
  LAQQuestionOutputSchema,
]);

const PracticeQuizOutputSchema = z.object({
  title: z.string().describe('Title of the practice quiz'),
  format: z.string().describe('Quiz format'),
  totalQuestions: z.number().describe('Total number of questions'),
  estimatedTime: z.number().describe('Estimated completion time in minutes'),
  instructions: z.string().describe('Instructions for taking the quiz'),
  questions: z.array(QuestionOutputSchema).describe('Array of quiz questions'),
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
   - Exact AP exam format with 4 options (labels will be added by frontend)
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

5. **Mathematical Content Formatting**:
   - Use LaTeX formatting for ALL mathematical expressions, equations, and formulas
   - Inline math: Use single dollar signs $E=mc^2$ for expressions within text
   - Block math: Use double dollar signs $$\\frac{d}{dx}[f(x)] = f'(x)$$ for standalone equations
   - Scientific notation: Use LaTeX format $6.022 \\times 10^{23}$ instead of 6.022e23
   - Fractions: Use \\frac{numerator}{denominator} format like $\\frac{1}{2}$
   - Subscripts and superscripts: Use _{subscript} and ^{superscript} like $H_2O$ and $x^2$
   - Greek letters: Use LaTeX commands like $\\alpha$, $\\beta$, $\\pi$, $\\Delta$
   - Special symbols: Use LaTeX commands like $\\infty$, $\\sum$, $\\int$, $\\sqrt{x}$
   - Chemical formulas: Use LaTeX format $CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O$
   - IMPORTANT: Escape backslashes properly in JSON strings (use \\\\frac instead of \\frac)

6. **Rubric Details**:
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

CRITICAL: Generate questions appropriate for the selected format only.

For MCQ questions, include these exact fields:
- type: "mcq"
- question: The question text
- options: Array of exactly 4 answer choices
- correctAnswer: The correct answer (must match one of the options exactly)
- explanation: Detailed explanation
- unit, difficulty, skillCategory, stimulus

For LEQ questions, include these exact fields:
- type: "leq"
- prompt: The essay prompt
- timeLimit: Time limit in minutes (typically 45)
- points: Total points (typically 6)
- rubric: Object with thesis, evidence, analysis, complexity (each with points and criteria)
- unit, difficulty, skillCategory, stimulus

For LAQ questions, include these exact fields:
- type: "laq"
- prompt: The main question prompt
- timeLimit: Time limit in minutes (typically 15)
- points: Total points (typically 3)
- parts: Array of parts with letter, question, points, sampleResponse
- unit, difficulty, skillCategory, stimulus

Example LEQ rubric:
"rubric": {
  "thesis": { "points": 1, "criteria": "Present a defensible thesis." },
  "evidence": { "points": 2, "criteria": "Provide specific evidence." },
  "analysis": { "points": 2, "criteria": "Use evidence to support argument." },
  "complexity": { "points": 1, "criteria": "Demonstrate sophisticated understanding." }
}

Example LAQ parts:
"parts": [
  { "letter": "a", "question": "Identify ONE cause...", "points": 1, "sampleResponse": "Economic factors..." },
  { "letter": "b", "question": "Explain ONE effect...", "points": 1, "sampleResponse": "Political changes..." },
  { "letter": "c", "question": "Describe ONE similarity...", "points": 1, "sampleResponse": "Both periods show..." }
]`,
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
      
      // Process questions based on their type
      const processedQuestions = (parsedOutput.questions || []).map((question: any, index: number) => {
        const baseQuestion = {
          type: question.type || input.format || 'mcq',
          unit: question.unit || 'General',
          difficulty: question.difficulty || input.difficulty || 'medium',
          skillCategory: question.skillCategory || 'Knowledge/Understanding',
          stimulus: question.stimulus || '',
        };

        if (question.type === 'mcq' || (!question.type && input.format === 'mcq')) {
          return {
            ...baseQuestion,
            type: 'mcq',
            question: question.question || `Question ${index + 1}`,
            options: question.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctAnswer: question.correctAnswer || 'Option 1',
            explanation: question.explanation || 'Explanation not provided.',
          };
        }
        
        if (question.type === 'leq' || (!question.type && input.format === 'leq')) {
          return {
            ...baseQuestion,
            type: 'leq',
            prompt: question.prompt || `Essay Question ${index + 1}`,
            timeLimit: question.timeLimit || 45,
            points: question.points || 6,
            rubric: question.rubric || {
              thesis: { points: 1, criteria: 'Present a defensible thesis that responds to the prompt.' },
              evidence: { points: 2, criteria: 'Provide specific evidence to support the thesis.' },
              analysis: { points: 2, criteria: 'Use evidence to support, qualify, or modify the argument.' },
              complexity: { points: 1, criteria: 'Demonstrate sophisticated understanding.' }
            },
          };
        }
        
        if (question.type === 'laq' || (!question.type && input.format === 'laq')) {
          return {
            ...baseQuestion,
            type: 'laq',
            prompt: question.prompt || `Short Answer Question ${index + 1}`,
            timeLimit: question.timeLimit || 15,
            points: question.points || 3,
            parts: question.parts || [
              { letter: 'a', question: 'Part A question', points: 1, sampleResponse: 'Sample response for part A' },
              { letter: 'b', question: 'Part B question', points: 1, sampleResponse: 'Sample response for part B' },
              { letter: 'c', question: 'Part C question', points: 1, sampleResponse: 'Sample response for part C' }
            ],
          };
        }

        return { ...baseQuestion, ...question };
      });

      // Add missing required fields with defaults if necessary
      const result = {
        title: parsedOutput.title || `AP ${input.apCourse} Practice Quiz`,
        format: parsedOutput.format || input.format,
        totalQuestions: parsedOutput.totalQuestions || processedQuestions.length || input.questionCount,
        estimatedTime: parsedOutput.estimatedTime || (
          input.format === 'leq' ? input.questionCount * 45 :
          input.format === 'laq' ? input.questionCount * 15 :
          input.questionCount * 2
        ),
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

    const result = await withAIResilience(
      () => flow(parseResult.data),
      {
        priority: 'high',
        timeout: 300000, // 5 minutes for quiz generation
        fallbackModel: 'googleai/gemini-1.5-flash'
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to generate practice quiz:', error);
    return NextResponse.json({ error: 'Failed to generate practice quiz' }, { status: 500 });
  }
}

export const POST = await withAuth(generatePracticeQuizHandler);