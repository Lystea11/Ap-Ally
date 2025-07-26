import 'package:flutter/material.dart';
import '../models/lesson_content_models.dart';
import '../models/lesson_model.dart';
import 'content_block_renderer.dart';
import 'practice_questions_widget.dart';
import 'flashcards_widget.dart';

class LessonViewer extends StatefulWidget {
  final LessonModel lesson;
  final LessonContent? lessonContent;
  final bool isLoading;
  final String? error;
  final VoidCallback? onToggleComplete;
  final VoidCallback? onNavigateNext;
  final LessonModel? nextLesson;
  final Function(int correct, int total)? onQuizComplete;
  final VoidCallback? onRetryQuiz;
  final Map<String, int>? quizResult;
  final bool practiceQuestionsLoading;

  const LessonViewer({
    super.key,
    required this.lesson,
    this.lessonContent,
    this.isLoading = false,
    this.error,
    this.onToggleComplete,
    this.onNavigateNext,
    this.nextLesson,
    this.onQuizComplete,
    this.onRetryQuiz,
    this.quizResult,
    this.practiceQuestionsLoading = false,
  });

  @override
  State<LessonViewer> createState() => _LessonViewerState();
}

class _LessonViewerState extends State<LessonViewer>
    with TickerProviderStateMixin {
  late TabController _tabController;
  int _currentTab = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(_onTabChanged);
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    super.dispose();
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) {
      setState(() {
        _currentTab = _tabController.index;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isLoading) {
      return _buildLoadingState();
    }

    if (widget.error != null) {
      return _buildErrorState();
    }

    if (widget.lessonContent == null) {
      return _buildEmptyState();
    }

    return _buildLessonContent();
  }

  Widget _buildLoadingState() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(
              'Generating lesson content...',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Our AI is creating personalized content for "${widget.lesson.title}"',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Error Loading Lesson',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              widget.error!,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                // Refresh lesson content
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.book_outlined,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No Content Available',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Lesson content is not available yet.',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLessonContent() {
    return Column(
      children: [
        // Tab bar
        Container(
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(12),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: TabBar(
            controller: _tabController,
            labelColor: Theme.of(context).primaryColor,
            unselectedLabelColor: Colors.grey[600],
            indicatorColor: Theme.of(context).primaryColor,
            indicatorWeight: 3,
            tabs: const [
              Tab(
                icon: Icon(Icons.book),
                text: 'Lesson',
              ),
              Tab(
                icon: Icon(Icons.quiz),
                text: 'Practice',
              ),
              Tab(
                icon: Icon(Icons.style),
                text: 'Flashcards',
              ),
            ],
          ),
        ),

        // Tab content
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildLessonTab(),
              _buildPracticeTab(),
              _buildFlashcardsTab(),
            ],
          ),
        ),

        // Bottom navigation
        _buildBottomNavigation(),
      ],
    );
  }

  Widget _buildLessonTab() {
    return Card(
      margin: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Lesson header
            _buildLessonHeader(),
            const SizedBox(height: 24),

            // Content blocks
            ...widget.lessonContent!.content.map((contentBlock) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: ContentBlockRenderer(contentBlock: contentBlock),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildPracticeTab() {
    final practiceQuestions = widget.lessonContent?.practiceQuestions ?? [];
    
    if (practiceQuestions.isEmpty) {
      if (widget.practiceQuestionsLoading) {
        return Card(
          margin: const EdgeInsets.all(16),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircularProgressIndicator(),
                const SizedBox(height: 16),
                Text(
                  'Generating practice questions...',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(
                  'This may take a few moments',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        );
      }
      
      return Card(
        margin: const EdgeInsets.all(16),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.quiz_outlined,
                size: 64,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 16),
              Text(
                'No Practice Questions',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Practice questions are being generated for this lesson.',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return PracticeQuestionsWidget(
      questions: practiceQuestions,
      onComplete: widget.onQuizComplete,
      onRetry: widget.onRetryQuiz,
      quizResult: widget.quizResult,
    );
  }

  Widget _buildFlashcardsTab() {
    final flashcards = widget.lessonContent?.flashcards;
    
    if (flashcards == null || flashcards.isEmpty) {
      return Card(
        margin: const EdgeInsets.all(16),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.style_outlined,
                size: 64,
                color: Colors.grey[400],
              ),
              const SizedBox(height: 16),
              Text(
                'No Flashcards Available',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Flashcards will be generated for this lesson.',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () {
                  // Generate flashcards
                },
                icon: const Icon(Icons.add),
                label: const Text('Generate Flashcards'),
              ),
            ],
          ),
        ),
      );
    }

    return FlashcardsWidget(flashcards: flashcards);
  }

  Widget _buildLessonHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              Icons.book,
              color: Theme.of(context).primaryColor,
              size: 28,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.lesson.title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Unit: ${widget.lesson.unitTitle}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            if (widget.lesson.completed)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.green[100],
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.check_circle,
                      size: 16,
                      color: Colors.green[700],
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Completed',
                      style: TextStyle(
                        color: Colors.green[700],
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildBottomNavigation() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        border: Border(
          top: BorderSide(
            color: Colors.grey[300]!,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          // Mark as complete button
          if (!widget.lesson.completed)
            Expanded(
              child: ElevatedButton.icon(
                onPressed: widget.onToggleComplete,
                icon: const Icon(Icons.check),
                label: const Text('Mark Complete'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).primaryColor,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          
          if (!widget.lesson.completed && widget.nextLesson != null)
            const SizedBox(width: 12),

          // Next lesson button
          if (widget.nextLesson != null)
            Expanded(
              child: OutlinedButton.icon(
                onPressed: widget.lesson.completed ? widget.onNavigateNext : null,
                icon: const Icon(Icons.arrow_forward),
                label: Text(
                  widget.lesson.completed 
                    ? 'Next: ${widget.nextLesson!.title}'
                    : 'Complete to continue',
                ),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
        ],
      ),
    );
  }
}