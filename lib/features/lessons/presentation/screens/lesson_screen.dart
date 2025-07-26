import 'package:flutter/material.dart';
import '../../../../shared/models/lesson_model.dart';
import '../../../../shared/models/lesson_content_models.dart';
import '../../../../shared/services/enhanced_ai_service.dart';
import '../../../../shared/services/study_service.dart';
import '../../../../shared/widgets/lesson_viewer.dart';

class LessonScreen extends StatefulWidget {
  final String lessonId;
  
  const LessonScreen({
    super.key,
    required this.lessonId,
  });

  @override
  State<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonScreen> {
  LessonModel? _lesson;
  LessonContent? _lessonContent;
  bool _isLoading = true;
  bool _practiceQuestionsLoading = false;
  String? _error;
  Map<String, int>? _quizResult;
  List<LessonModel> _allLessons = [];

  @override
  void initState() {
    super.initState();
    _initializeLesson();
  }

  Future<void> _initializeLesson() async {
    try {
      // Initialize AI service
      EnhancedAIService.initialize();
      
      // Load lesson details
      await _loadLessonDetails();
      
      // Generate lesson content if not exists
      if (_lesson != null) {
        await _generateLessonContent();
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to load lesson: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _loadLessonDetails() async {
    try {
      final studyService = StudyService();
      
      // Load the specific lesson
      final lessons = await studyService.getAllLessons();
      _lesson = lessons.firstWhere(
        (lesson) => lesson.id == widget.lessonId,
        orElse: () => throw Exception('Lesson not found'),
      );
      
      // Load all lessons for navigation
      _allLessons = lessons;
      
      setState(() {});
    } catch (e) {
      throw Exception('Failed to load lesson details: $e');
    }
  }

  Future<void> _generateLessonContent() async {
    if (_lesson == null) return;

    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      // Check if lesson already has content
      if (_lesson!.content != null && _lesson!.content!.isNotEmpty) {
        try {
          _lessonContent = LessonContent.fromJson(_lesson!.content!);
          setState(() {
            _isLoading = false;
          });
          return;
        } catch (e) {
          // Content exists but is malformed, regenerate
          debugPrint('Existing content malformed, regenerating: $e');
        }
      }

      // Generate new content
      final topic = '${_lesson!.unitTitle}: ${_lesson!.title}';
      
      // Generate lesson content and practice questions separately for better UX
      final contentBlocks = await EnhancedAIService.generateLessonContentOnly(
        topic: topic,
      );

      setState(() {
        _lessonContent = LessonContent(
          content: contentBlocks,
          practiceQuestions: [], // Will be loaded separately
        );
        _isLoading = false;
        _practiceQuestionsLoading = true;
      });

      // Generate practice questions in background
      try {
        final practiceQuestions = await EnhancedAIService.generatePracticeQuestionsOnly(
          topic: topic,
        );

        setState(() {
          _lessonContent = LessonContent(
            content: contentBlocks,
            practiceQuestions: practiceQuestions,
          );
          _practiceQuestionsLoading = false;
        });

        // Save the complete content to the lesson
        await _saveLessonContent();
      } catch (e) {
        debugPrint('Failed to generate practice questions: $e');
        setState(() {
          _practiceQuestionsLoading = false;
        });
      }

    } catch (e) {
      setState(() {
        _error = 'Failed to generate lesson content: $e';
        _isLoading = false;
        _practiceQuestionsLoading = false;
      });
    }
  }

  Future<void> _saveLessonContent() async {
    if (_lesson == null || _lessonContent == null) return;

    try {
      final updatedLesson = _lesson!.copyWith(
        content: _lessonContent!.toJson(),
      );

      final studyService = StudyService();
      await studyService.updateLesson(updatedLesson);
      
      setState(() {
        _lesson = updatedLesson;
      });
    } catch (e) {
      debugPrint('Failed to save lesson content: $e');
    }
  }

  Future<void> _toggleLessonComplete() async {
    if (_lesson == null) return;

    try {
      final studyService = StudyService();
      final updatedLesson = _lesson!.copyWith(completed: !_lesson!.completed);
      
      await studyService.updateLesson(updatedLesson);
      
      setState(() {
        _lesson = updatedLesson;
      });

      if (updatedLesson.completed) {
        _navigateToNextLesson();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update lesson: $e')),
        );
      }
    }
  }

  void _handleQuizComplete(int correct, int total) {
    setState(() {
      _quizResult = {'correct': correct, 'total': total};
    });

    // Auto-complete lesson if quiz passed
    if (correct >= 4 && _lesson != null && !_lesson!.completed) {
      _toggleLessonComplete();
    }
  }

  void _handleRetryQuiz() {
    setState(() {
      _quizResult = null;
    });
  }

  void _navigateToNextLesson() {
    final nextLesson = _getNextLesson();
    if (nextLesson != null) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => LessonScreen(lessonId: nextLesson.id),
        ),
      );
    } else {
      Navigator.of(context).pop();
    }
  }

  LessonModel? _getNextLesson() {
    if (_lesson == null) return null;
    
    final currentIndex = _allLessons.indexWhere((l) => l.id == _lesson!.id);
    if (currentIndex == -1 || currentIndex >= _allLessons.length - 1) {
      return null;
    }
    
    return _allLessons[currentIndex + 1];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_lesson?.title ?? 'Loading...'),
        elevation: 0,
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        foregroundColor: Theme.of(context).textTheme.bodyLarge?.color,
      ),
      body: SafeArea(
        child: _lesson == null && _error == null
            ? const Center(child: CircularProgressIndicator())
            : LessonViewer(
                lesson: _lesson!,
                lessonContent: _lessonContent,
                isLoading: _isLoading,
                error: _error,
                onToggleComplete: _toggleLessonComplete,
                onNavigateNext: _navigateToNextLesson,
                nextLesson: _getNextLesson(),
                onQuizComplete: _handleQuizComplete,
                onRetryQuiz: _handleRetryQuiz,
                quizResult: _quizResult,
                practiceQuestionsLoading: _practiceQuestionsLoading,
              ),
      ),
    );
  }
}