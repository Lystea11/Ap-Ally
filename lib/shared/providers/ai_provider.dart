import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/ai_service.dart';

final aiServiceProvider = Provider<AIService>((ref) {
  return AIService();
});

final aiControllerProvider = Provider<AIController>((ref) {
  return AIController();
});

class AIController {
  Future<String> generateRoadmap({
    required String courseName,
    required Map<String, dynamic> assessmentResults,
    required int studyTimeWeeks,
  }) async {
    return await AIService.generateRoadmap(
      courseName: courseName,
      assessmentResults: assessmentResults,
      studyTimeWeeks: studyTimeWeeks,
    );
  }

  Future<String> generateLessonContent({
    required String unitTitle,
    required String lessonTitle,
    required List<String> objectives,
    required String difficultyLevel,
  }) async {
    return await AIService.generateLessonContent(
      unitTitle: unitTitle,
      lessonTitle: lessonTitle,
      objectives: objectives,
      difficultyLevel: difficultyLevel,
    );
  }

  Future<List<Map<String, String>>> generateFlashcards({
    required String lessonContent,
    required int cardCount,
  }) async {
    return await AIService.generateFlashcards(
      lessonContent: lessonContent,
      cardCount: cardCount,
    );
  }

  Future<List<Map<String, dynamic>>> generateQuizQuestions({
    required String courseName,
    required List<String> units,
    required int questionCount,
    required String questionType,
  }) async {
    return await AIService.generateQuizQuestions(
      courseName: courseName,
      units: units,
      questionCount: questionCount,
      questionType: questionType,
    );
  }

  Future<String> provideFeedback({
    required String question,
    required String studentAnswer,
    required String correctAnswer,
    required String subject,
  }) async {
    return await AIService.provideFeedback(
      question: question,
      studentAnswer: studentAnswer,
      correctAnswer: correctAnswer,
      subject: subject,
    );
  }

  Future<List<String>> generateStudyGoals({
    required Map<String, double> subjectProgress,
    required int daysUntilExam,
    required int dailyStudyMinutes,
  }) async {
    return await AIService.generateStudyGoals(
      subjectProgress: subjectProgress,
      daysUntilExam: daysUntilExam,
      dailyStudyMinutes: dailyStudyMinutes,
    );
  }
}