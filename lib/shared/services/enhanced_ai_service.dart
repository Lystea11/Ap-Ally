import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../../core/config/app_config.dart';
import '../models/lesson_content_models.dart';

class EnhancedAIService {
  static GenerativeModel? _model;
  static final Random _random = Random();
  
  static GenerativeModel get model {
    if (_model == null) {
      throw Exception('AI model not initialized. Call initialize() first.');
    }
    return _model!;
  }

  static void initialize() {
    _model = GenerativeModel(
      model: 'gemini-1.5-flash',
      apiKey: AppConfig.geminiApiKey,
      generationConfig: GenerationConfig(
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      ),
    );
  }

  /// Generate lesson content only (mirrors web app's generateLessonContentOnly)
  static Future<List<ContentBlock>> generateLessonContentOnly({
    required String topic,
  }) async {
    return _executeWithResilience(() async {
      final prompt = '''
You are an expert educator creating comprehensive lesson content for AP level courses. Your goal is to create clear, structured, and educational content that thoroughly covers the given topic.

Topic: $topic

**Instructions:**
1. **Lesson Content ('content' field):**
   - Generate the lesson as an array of content blocks. Each block must have a 'type'.
   - The 'content' field must include the Title of the lesson once at the beginning.
   - The 'type' can be either 'markdown', 'table', or 'diagram'.
   - For regular text, use {"type": "markdown", "content": "..."}. Use Markdown for formatting (subheadings, lists, bold).
   - **For tables, use the JSON format:** {"type": "table", "headers": ["Header 1", "Header 2"], "rows": [["Row 1 Col 1", "Row 1 Col 2"], ["Row 2 Col 1", "Row 2 Col 2"]]}. This is crucial for correct rendering.
   - **For diagrams, use the Mermaid format:** {"type": "diagram", "diagramType": "mermaid", "code": "graph TD; A-->B;"}.
   - Use LaTeX for all mathematical equations (e.g., \$E=mc^2\$ or \$...\$). The rendering happens on the client, so do not use markdown tables for equations.
   - **IMPORTANT**: When generating complex content like Markdown tables that contain LaTeX, you MUST escape special characters to prevent rendering issues. For example, use '\\|' instead of '|' inside LaTeX equations within a table.

2. **Content Guidelines:**
   - Focus on creating comprehensive, educational content that covers key concepts
   - Include examples, explanations, and relevant applications
   - Use clear, concise language appropriate for AP level students
   - Structure content logically with proper headings and organization
   - **NOTE**: Practice questions are handled separately - focus only on the lesson content itself

3. **Mathematical Formatting:**
   - **CRITICAL**: All mathematical expressions MUST use LaTeX formatting with dollar signs
   - Use \$x^2\$ for superscripts, \$H_2O\$ for subscripts, \$\\pi\$ for pi, \$\\int\$ for integrals, \$\\frac{a}{b}\$ for fractions

Return ONLY a JSON object with the following structure:
{
  "content": [
    {
      "type": "markdown",
      "content": "# Lesson Title\\n\\nIntroduction content..."
    },
    {
      "type": "table", 
      "headers": ["Concept", "Definition"],
      "rows": [["Term 1", "Definition 1"], ["Term 2", "Definition 2"]]
    },
    {
      "type": "diagram",
      "diagramType": "mermaid",
      "code": "graph TD; A[Start] --> B[Process]; B --> C[End];"
    }
  ]
}
''';

      final response = await model.generateContent([Content.text(prompt)]);
      final responseText = response.text?.trim() ?? '';
      
      if (responseText.isEmpty) {
        throw Exception('Empty response from AI model');
      }

      try {
        final Map<String, dynamic> jsonResponse = jsonDecode(responseText);
        final List<dynamic> contentList = jsonResponse['content'] as List;
        
        return contentList
            .map((item) => ContentBlock.fromJson(item as Map<String, dynamic>))
            .toList();
      } catch (e) {
        throw Exception('Failed to parse AI response: $e\nResponse: $responseText');
      }
    });
  }

  /// Generate practice questions only (mirrors web app's generatePracticeQuestionsOnly)
  static Future<List<PracticeQuestion>> generatePracticeQuestionsOnly({
    required String topic,
    bool includeHints = true,
  }) async {
    return _executeWithResilience(() async {
      final prompt = '''
You are an expert educator creating engaging practice questions for AP level courses. Your goal is to create exactly 5 high-quality multiple choice questions that test students' understanding of the given topic in an interactive, one-question-at-a-time format.

Topic: $topic

**Instructions:**

1. **Question Design Philosophy:**
   - Questions should progressively test different aspects of the topic
   - Mix conceptual understanding with application problems
   - Ensure questions are challenging but fair for AP level students
   - Questions should be self-contained (not dependent on previous questions)

2. **For Each Question:**
   - **Question Text**: Write a clear, specific question that tests key concepts
   - **4 Multiple Choice Options**: Create plausible distractors based on common misconceptions
   - **Correct Answer Index**: Specify the 0-based index (0, 1, 2, or 3) of the correct answer
   - **Explanation**: Provide a clear, educational explanation of why the answer is correct
   - **Hint**: Create a helpful hint that guides thinking without giving away the answer

3. **Mathematical Formatting:**
   - **CRITICAL**: All mathematical expressions MUST use LaTeX formatting with dollar signs
   - Use \$x^2\$ for superscripts, \$H_2O\$ for subscripts, \$\\pi\$ for pi, \$\\int\$ for integrals, \$\\frac{a}{b}\$ for fractions
   - Apply this to questions, options, explanations, AND hints

4. **Hint Guidelines:**
   - Hints should redirect students to key concepts or methods
   - Should NOT directly state the answer
   - Can suggest what to look for, what formula to consider, or what concept applies
   - Examples: "Consider which law governs this situation", "Think about the relationship between X and Y", "What happens to the variable when the condition changes?"

5. **Quality Standards:**
   - Each question should have exactly one clearly correct answer
   - Distractors should be plausible but definitively wrong
   - Questions should cover different difficulty levels (mix of easier and harder)
   - Avoid trick questions or overly complex scenarios

Return ONLY a JSON object with the following structure:
{
  "practiceQuestions": [
    {
      "question": "What is the acceleration due to gravity on Earth?",
      "options": ["\$9.8 \\\\text{ m/s}^2\$", "\$10 \\\\text{ m/s}^2\$", "\$9.8 \\\\text{ m/s}\$", "\$10 \\\\text{ m/s}\$"],
      "correctAnswerIndex": 0,
      "explanation": "The standard acceleration due to gravity on Earth is \$9.8 \\\\text{ m/s}^2\$. This is a fundamental constant in physics.",
      "hint": "Remember that acceleration has units of distance per time squared."
    }
  ]
}
''';

      final response = await model.generateContent([Content.text(prompt)]);
      final responseText = response.text?.trim() ?? '';
      
      if (responseText.isEmpty) {
        throw Exception('Empty response from AI model');
      }

      try {
        final Map<String, dynamic> jsonResponse = jsonDecode(responseText);
        final List<dynamic> questionsList = jsonResponse['practiceQuestions'] as List;
        
        return questionsList
            .map((item) => PracticeQuestion.fromJson(item as Map<String, dynamic>))
            .toList();
      } catch (e) {
        throw Exception('Failed to parse practice questions: $e\nResponse: $responseText');
      }
    });
  }

  /// Generate flashcards for a topic (mirrors web app's generateFlashcards)
  static Future<List<Flashcard>> generateFlashcards({
    required String topic,
    String? lessonContent,
  }) async {
    return _executeWithResilience(() async {
      final prompt = '''
You are an expert educator creating high-quality study flashcards for AP level courses. Your goal is to create 8-12 effective flashcards that help students memorize key concepts, formulas, definitions, and important details from the given topic.

Topic: $topic
${lessonContent != null ? 'Lesson Content: $lessonContent' : ''}

**Instructions:**

1. **Flashcard Design Philosophy:**
   - Create cards that test essential knowledge students need to memorize
   - Mix different types of content: definitions, formulas, key facts, concepts
   - Ensure questions are specific and answers are concise but complete
   - Cover the most important points from the topic comprehensively

2. **For Each Flashcard:**
   - **Question**: Write a clear, specific question or prompt (front of card)
   - **Answer**: Provide a concise, accurate answer or explanation (back of card)
   - Questions can be: "What is...", "Define...", "What formula...", "Who discovered...", etc.
   - Answers should be brief but complete - aim for 1-3 sentences

3. **Mathematical Formatting:**
   - **CRITICAL**: All mathematical expressions MUST use LaTeX formatting with dollar signs
   - Use \$x^2\$ for superscripts, \$H_2O\$ for subscripts, \$\\pi\$ for pi, \$\\int\$ for integrals, \$\\frac{a}{b}\$ for fractions
   - Apply this to both questions AND answers

4. **Content Guidelines:**
   - Focus on memorizable facts, not complex problem-solving
   - Include key vocabulary, important dates, formulas, constants
   - Cover fundamental concepts that appear frequently on AP exams
   - Avoid overly complex or multi-step problems

5. **Quality Standards:**
   - Each question should have one clear, definitive answer
   - Questions should be standalone (not dependent on other cards)
   - Vary difficulty levels but keep all content appropriate for AP students
   - Ensure factual accuracy and clear explanations

Return ONLY a JSON object with the following structure:
{
  "flashcards": [
    {
      "question": "What is the acceleration due to gravity on Earth?",
      "answer": "The acceleration due to gravity on Earth is \$9.8 \\\\text{ m/s}^2\$ (or \$9.81 \\\\text{ m/s}^2\$ more precisely)."
    },
    {
      "question": "Define kinetic energy.",
      "answer": "Kinetic energy is the energy an object possesses due to its motion, calculated using \$KE = \\\\frac{1}{2}mv^2\$ where \$m\$ is mass and \$v\$ is velocity."
    }
  ]
}
''';

      final response = await model.generateContent([Content.text(prompt)]);
      final responseText = response.text?.trim() ?? '';
      
      if (responseText.isEmpty) {
        throw Exception('Empty response from AI model');
      }

      try {
        final Map<String, dynamic> jsonResponse = jsonDecode(responseText);
        final List<dynamic> flashcardsList = jsonResponse['flashcards'] as List;
        
        return flashcardsList
            .map((item) => Flashcard.fromJson(item as Map<String, dynamic>))
            .toList();
      } catch (e) {
        throw Exception('Failed to parse flashcards: $e\nResponse: $responseText');
      }
    });
  }

  /// Generate complete lesson content (mirrors web app's generateLessonContent)
  static Future<LessonContent> generateLessonContent({
    required String topic,
  }) async {
    return _executeWithResilience(() async {
      // Generate lesson content and practice questions in parallel for efficiency
      final futures = await Future.wait([
        generateLessonContentOnly(topic: topic),
        generatePracticeQuestionsOnly(topic: topic),
      ]);

      final List<ContentBlock> content = futures[0] as List<ContentBlock>;
      final List<PracticeQuestion> practiceQuestions = futures[1] as List<PracticeQuestion>;

      return LessonContent(
        content: content,
        practiceQuestions: practiceQuestions,
      );
    });
  }

  /// Execute operation with resilience (retry logic, error handling)
  static Future<T> _executeWithResilience<T>(
    Future<T> Function() operation, {
    int maxRetries = 3,
    Duration baseDelay = const Duration(seconds: 1),
  }) async {
    Exception? lastException;

    for (int attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (e) {
        lastException = e is Exception ? e : Exception(e.toString());
        
        if (attempt == maxRetries) {
          break;
        }

        // Check if error is retryable
        if (!_isRetryableError(e)) {
          break;
        }

        // Exponential backoff with jitter
        final delay = Duration(
          milliseconds: (baseDelay.inMilliseconds * pow(2, attempt)).round() +
              _random.nextInt(1000),
        );
        
        debugPrint('AI request failed (attempt ${attempt + 1}/$maxRetries), retrying in ${delay.inMilliseconds}ms: $e');
        await Future.delayed(delay);
      }
    }

    throw lastException ?? Exception('Unknown error in AI service');
  }

  static bool _isRetryableError(dynamic error) {
    final errorMessage = error.toString().toLowerCase();
    final retryablePatterns = [
      'model overloaded',
      'rate limit exceeded', 
      'timeout',
      'service unavailable',
      'internal server error',
      '429',
      '500',
      '502',
      '503',
      '504',
    ];

    return retryablePatterns.any((pattern) => errorMessage.contains(pattern));
  }
}