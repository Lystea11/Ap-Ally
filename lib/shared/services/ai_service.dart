import 'package:google_generative_ai/google_generative_ai.dart';
import '../../core/config/app_config.dart';

class AIService {
  static GenerativeModel? _model;
  
  static GenerativeModel get model {
    if (_model == null) {
      throw Exception('AI model not initialized. Call initialize() first.');
    }
    return _model!;
  }

  static void initialize() {
    _model = GenerativeModel(
      model: 'gemini-pro',
      apiKey: AppConfig.geminiApiKey,
      generationConfig: GenerationConfig(
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      ),
    );
  }

  // Generate personalized roadmap based on user assessment
  static Future<String> generateRoadmap({
    required String courseName,
    required Map<String, dynamic> assessmentResults,
    required int studyTimeWeeks,
  }) async {
    final prompt = '''
Generate a personalized study roadmap for an AP $courseName student based on their assessment results.

Assessment Results:
${assessmentResults.entries.map((e) => '${e.key}: ${e.value}').join('\n')}

Study Time Available: $studyTimeWeeks weeks

Please create a structured roadmap with:
1. Units organized by priority based on assessment gaps
2. Specific learning objectives for each unit
3. Recommended study materials and resources
4. Timeline for completion
5. Practice questions and review sessions

Format the response as JSON with the following structure:
{
  "units": [
    {
      "title": "Unit Title",
      "priority": "high|medium|low",
      "weeks": 2,
      "lessons": [
        {
          "title": "Lesson Title",
          "objectives": ["objective1", "objective2"],
          "content": "lesson content overview",
          "estimatedMinutes": 45
        }
      ]
    }
  ]
}
    ''';

    try {
      final response = await model.generateContent([Content.text(prompt)]);
      return response.text ?? '';
    } catch (e) {
      throw Exception('Failed to generate roadmap: $e');
    }
  }

  // Generate lesson content
  static Future<String> generateLessonContent({
    required String unitTitle,
    required String lessonTitle,
    required List<String> objectives,
    required String difficultyLevel,
  }) async {
    final prompt = '''
Create comprehensive lesson content for:
Unit: $unitTitle
Lesson: $lessonTitle
Difficulty: $difficultyLevel

Learning Objectives:
${objectives.map((obj) => '- $obj').join('\n')}

Please include:
1. Clear explanations with examples
2. Key concepts and definitions
3. Practice problems with solutions
4. Common misconceptions to avoid
5. Real-world applications

Format as markdown with proper headings, bullet points, and code blocks where applicable.
Include LaTeX notation for mathematical expressions using \$ delimiters.
    ''';

    try {
      final response = await model.generateContent([Content.text(prompt)]);
      return response.text ?? '';
    } catch (e) {
      throw Exception('Failed to generate lesson content: $e');
    }
  }

  // Generate flashcards for a lesson
  static Future<List<Map<String, String>>> generateFlashcards({
    required String lessonContent,
    required int cardCount,
  }) async {
    final prompt = '''
Based on the following lesson content, generate $cardCount flashcards.

Lesson Content:
$lessonContent

Create flashcards that cover key concepts, definitions, and important facts.
Format as JSON array:
[
  {
    "question": "Question text",
    "answer": "Answer text"
  }
]

Focus on:
- Key vocabulary and definitions
- Important formulas or processes
- Critical thinking questions
- Common exam topics
    ''';

    try {
      final response = await model.generateContent([Content.text(prompt)]);
      final responseText = response.text ?? '';
      
      // Parse JSON response
      // Note: In production, you'd want more robust JSON parsing
      final List<Map<String, String>> flashcards = [];
      
      // Simple regex to extract question-answer pairs
      final questionAnswerPattern = RegExp(r'"question":\s*"([^"]+)",\s*"answer":\s*"([^"]+)"');
      final matches = questionAnswerPattern.allMatches(responseText);
      
      for (final match in matches) {
        flashcards.add({
          'question': match.group(1) ?? '',
          'answer': match.group(2) ?? '',
        });
      }
      
      return flashcards;
    } catch (e) {
      throw Exception('Failed to generate flashcards: $e');
    }
  }

  // Generate practice quiz questions
  static Future<List<Map<String, dynamic>>> generateQuizQuestions({
    required String courseName,
    required List<String> units,
    required int questionCount,
    required String questionType, // 'multiple_choice' or 'free_response'
  }) async {
    final prompt = '''
Generate $questionCount $questionType questions for AP $courseName covering these units:
${units.map((unit) => '- $unit').join('\n')}

For multiple choice questions, include 4 options with one correct answer.
For free response questions, include a detailed rubric.

Format as JSON:
[
  {
    "question": "Question text",
    "type": "multiple_choice",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A",
    "explanation": "Why this is correct",
    "unit": "Unit name",
    "difficulty": "easy|medium|hard"
  }
]

For free response:
[
  {
    "question": "Question text",
    "type": "free_response",
    "rubric": "Scoring guidelines",
    "sample_answer": "Example response",
    "unit": "Unit name",
    "difficulty": "easy|medium|hard"
  }
]
    ''';

    try {
      final response = await model.generateContent([Content.text(prompt)]);
      final responseText = response.text ?? '';
      
      // Simple parsing - in production, use proper JSON parsing
      final List<Map<String, dynamic>> questions = [];
      
      // This is a simplified version - you'd want robust JSON parsing
      return questions;
    } catch (e) {
      throw Exception('Failed to generate quiz questions: $e');
    }
  }

  // Provide feedback on student answers
  static Future<String> provideFeedback({
    required String question,
    required String studentAnswer,
    required String correctAnswer,
    required String subject,
  }) async {
    final prompt = '''
Provide constructive feedback for a student's answer to an AP $subject question.

Question: $question
Student Answer: $studentAnswer
Correct Answer: $correctAnswer

Please provide:
1. Whether the answer is correct, partially correct, or incorrect
2. What the student did well
3. Areas for improvement
4. Specific suggestions for better understanding
5. Encouragement and next steps

Keep the tone supportive and educational.
    ''';

    try {
      final response = await model.generateContent([Content.text(prompt)]);
      return response.text ?? '';
    } catch (e) {
      throw Exception('Failed to provide feedback: $e');
    }
  }

  // Generate study goals based on progress
  static Future<List<String>> generateStudyGoals({
    required Map<String, double> subjectProgress,
    required int daysUntilExam,
    required int dailyStudyMinutes,
  }) async {
    final prompt = '''
Generate personalized study goals for an AP student with $daysUntilExam days until the exam and $dailyStudyMinutes minutes of daily study time.

Current Progress:
${subjectProgress.entries.map((e) => '${e.key}: ${(e.value * 100).toInt()}%').join('\n')}

Create 5-7 SMART goals that are:
- Specific and actionable
- Measurable
- Achievable given the time constraints
- Relevant to exam success
- Time-bound

Format as a simple list of goal statements.
    ''';

    try {
      final response = await model.generateContent([Content.text(prompt)]);
      final responseText = response.text ?? '';
      
      // Extract goals from response
      final goals = responseText
          .split('\n')
          .where((line) => line.trim().isNotEmpty && line.contains('-'))
          .map((line) => line.trim().replaceFirst(RegExp(r'^[-•]\s*'), ''))
          .toList();
      
      return goals;
    } catch (e) {
      throw Exception('Failed to generate study goals: $e');
    }
  }
}