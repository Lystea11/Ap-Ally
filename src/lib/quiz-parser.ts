import { ParsedQuiz, QuizQuestion } from "./types";

export function parseQuiz(quizString: string): ParsedQuiz {
  const questions: QuizQuestion[] = [];
  
  // Split the string into individual questions. Assumes questions start with a number and a period.
  const questionBlocks = quizString.trim().split(/\n(?=\d+\.)/);

  questionBlocks.forEach((block, index) => {
    const lines = block.trim().split('\n');
    if (lines.length < 2) return;

    // The first line is the question text
    const questionText = lines[0].replace(/^\d+\.\s*/, '').trim();

    // The rest of the lines are options
    const options = lines.slice(1).map(line => line.replace(/^[A-Z]\)\s*/, '').trim()).filter(Boolean);

    if (questionText && options.length > 0) {
      questions.push({
        id: index + 1,
        question: questionText,
        options: options,
      });
    }
  });

  return { questions };
}
