import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import '../models/lesson_content_models.dart';

class PracticeQuestionsWidget extends StatefulWidget {
  final List<PracticeQuestion> questions;
  final Function(int correct, int total)? onComplete;
  final VoidCallback? onRetry;
  final Map<String, int>? quizResult;

  const PracticeQuestionsWidget({
    super.key,
    required this.questions,
    this.onComplete,
    this.onRetry,
    this.quizResult,
  });

  @override
  State<PracticeQuestionsWidget> createState() => _PracticeQuestionsWidgetState();
}

class _PracticeQuestionsWidgetState extends State<PracticeQuestionsWidget>
    with TickerProviderStateMixin {
  late PageController _pageController;
  int _currentQuestionIndex = 0;
  List<int?> _selectedAnswers = [];
  List<bool> _answersRevealed = [];
  List<bool> _hintsRevealed = [];
  bool _quizCompleted = false;
  late AnimationController _feedbackAnimationController;
  late Animation<double> _feedbackAnimation;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _selectedAnswers = List.filled(widget.questions.length, null);
    _answersRevealed = List.filled(widget.questions.length, false);
    _hintsRevealed = List.filled(widget.questions.length, false);
    
    _feedbackAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _feedbackAnimation = CurvedAnimation(
      parent: _feedbackAnimationController,
      curve: Curves.elasticOut,
    );

    // Check if quiz was already completed
    if (widget.quizResult != null) {
      _quizCompleted = true;
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    _feedbackAnimationController.dispose();
    super.dispose();
  }

  void _selectAnswer(int answerIndex) {
    if (_answersRevealed[_currentQuestionIndex] || _quizCompleted) return;

    setState(() {
      _selectedAnswers[_currentQuestionIndex] = answerIndex;
    });
  }

  void _revealAnswer() {
    if (_selectedAnswers[_currentQuestionIndex] == null || _quizCompleted) return;

    setState(() {
      _answersRevealed[_currentQuestionIndex] = true;
    });

    _feedbackAnimationController.forward().then((_) {
      _feedbackAnimationController.reverse();
    });
  }

  void _showHint() {
    if (_answersRevealed[_currentQuestionIndex] || _quizCompleted) return;

    setState(() {
      _hintsRevealed[_currentQuestionIndex] = true;
    });
  }

  void _nextQuestion() {
    if (_currentQuestionIndex < widget.questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
      });
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _completeQuiz();
    }
  }

  void _previousQuestion() {
    if (_currentQuestionIndex > 0) {
      setState(() {
        _currentQuestionIndex--;
      });
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _completeQuiz() {
    final correctAnswers = _calculateScore();
    setState(() {
      _quizCompleted = true;
    });

    widget.onComplete?.call(correctAnswers, widget.questions.length);
  }

  int _calculateScore() {
    int correct = 0;
    for (int i = 0; i < widget.questions.length; i++) {
      if (_selectedAnswers[i] == widget.questions[i].correctAnswerIndex) {
        correct++;
      }
    }
    return correct;
  }

  void _retryQuiz() {
    setState(() {
      _currentQuestionIndex = 0;
      _selectedAnswers = List.filled(widget.questions.length, null);
      _answersRevealed = List.filled(widget.questions.length, false);
      _hintsRevealed = List.filled(widget.questions.length, false);
      _quizCompleted = false;
    });
    
    _pageController.animateToPage(
      0,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );

    widget.onRetry?.call();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.questions.isEmpty) {
      return const Center(
        child: Text('No practice questions available.'),
      );
    }

    if (_quizCompleted) {
      return _buildResultsView();
    }

    return Column(
      children: [
        // Progress indicator
        _buildProgressIndicator(),
        
        // Question content
        Expanded(
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() {
                _currentQuestionIndex = index;
              });
            },
            itemCount: widget.questions.length,
            itemBuilder: (context, index) {
              return _buildQuestionCard(widget.questions[index], index);
            },
          ),
        ),

        // Navigation buttons
        _buildNavigationButtons(),
      ],
    );
  }

  Widget _buildProgressIndicator() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Question ${_currentQuestionIndex + 1} of ${widget.questions.length}',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              Text(
                '${((_currentQuestionIndex + 1) / widget.questions.length * 100).round()}%',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: (_currentQuestionIndex + 1) / widget.questions.length,
            backgroundColor: Colors.grey[300],
            valueColor: AlwaysStoppedAnimation<Color>(
              Theme.of(context).primaryColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionCard(PracticeQuestion question, int questionIndex) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Question text
            _renderMathText(
              question.question,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 20),

            // Answer options
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  children: List.generate(question.options.length, (index) {
                    return _buildAnswerOption(question, questionIndex, index);
                  }),
                ),
              ),
            ),

            // Hint section
            if (_hintsRevealed[questionIndex])
              _buildHintSection(question),

            // Feedback section
            if (_answersRevealed[questionIndex])
              _buildFeedbackSection(question, questionIndex),

            // Action buttons
            _buildActionButtons(questionIndex),
          ],
        ),
      ),
    );
  }

  Widget _buildAnswerOption(PracticeQuestion question, int questionIndex, int optionIndex) {
    final isSelected = _selectedAnswers[questionIndex] == optionIndex;
    final isRevealed = _answersRevealed[questionIndex];
    final isCorrect = optionIndex == question.correctAnswerIndex;
    
    Color? backgroundColor;
    Color? borderColor;
    
    if (isRevealed) {
      if (isCorrect) {
        backgroundColor = Colors.green[100];
        borderColor = Colors.green[400];
      } else if (isSelected && !isCorrect) {
        backgroundColor = Colors.red[100];
        borderColor = Colors.red[400];
      }
    } else if (isSelected) {
      backgroundColor = Theme.of(context).primaryColor.withOpacity(0.1);
      borderColor = Theme.of(context).primaryColor;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: backgroundColor ?? Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _selectAnswer(optionIndex),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: borderColor ?? Colors.grey[300]!,
                width: 2,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isSelected ? Theme.of(context).primaryColor : Colors.transparent,
                    border: Border.all(
                      color: isSelected ? Theme.of(context).primaryColor : Colors.grey[400]!,
                      width: 2,
                    ),
                  ),
                  child: isSelected
                      ? const Icon(
                          Icons.check,
                          size: 16,
                          color: Colors.white,
                        )
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _renderMathText(question.options[optionIndex]),
                ),
                if (isRevealed && isCorrect)
                  Icon(
                    Icons.check_circle,
                    color: Colors.green[600],
                    size: 24,
                  ),
                if (isRevealed && isSelected && !isCorrect)
                  Icon(
                    Icons.cancel,
                    color: Colors.red[600],
                    size: 24,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHintSection(PracticeQuestion question) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.lightbulb_outline,
                color: Colors.blue[700],
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Hint',
                style: TextStyle(
                  color: Colors.blue[700],
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _renderMathText(question.hint),
        ],
      ),
    );
  }

  Widget _buildFeedbackSection(PracticeQuestion question, int questionIndex) {
    final isCorrect = _selectedAnswers[questionIndex] == question.correctAnswerIndex;
    
    return AnimatedBuilder(
      animation: _feedbackAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: 1.0 + (_feedbackAnimation.value * 0.05),
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isCorrect ? Colors.green[50] : Colors.orange[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isCorrect ? Colors.green[200]! : Colors.orange[200]!,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      isCorrect ? Icons.check_circle : Icons.info_outline,
                      color: isCorrect ? Colors.green[700] : Colors.orange[700],
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      isCorrect ? 'Correct!' : 'Explanation',
                      style: TextStyle(
                        color: isCorrect ? Colors.green[700] : Colors.orange[700],
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                _renderMathText(question.explanation),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildActionButtons(int questionIndex) {
    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Row(
        children: [
          // Hint button
          if (!_hintsRevealed[questionIndex] && !_answersRevealed[questionIndex])
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _showHint,
                icon: const Icon(Icons.lightbulb_outline),
                label: const Text('Show Hint'),
              ),
            ),

          if (!_hintsRevealed[questionIndex] && !_answersRevealed[questionIndex])
            const SizedBox(width: 12),

          // Check answer button
          if (!_answersRevealed[questionIndex])
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _selectedAnswers[questionIndex] != null ? _revealAnswer : null,
                icon: const Icon(Icons.check),
                label: const Text('Check Answer'),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildNavigationButtons() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Previous button
          OutlinedButton.icon(
            onPressed: _currentQuestionIndex > 0 ? _previousQuestion : null,
            icon: const Icon(Icons.arrow_back),
            label: const Text('Previous'),
          ),

          // Next/Complete button
          ElevatedButton.icon(
            onPressed: _answersRevealed[_currentQuestionIndex] 
                ? (_currentQuestionIndex < widget.questions.length - 1 ? _nextQuestion : _completeQuiz)
                : null,
            icon: Icon(
              _currentQuestionIndex < widget.questions.length - 1 
                  ? Icons.arrow_forward 
                  : Icons.check_circle,
            ),
            label: Text(
              _currentQuestionIndex < widget.questions.length - 1 
                  ? 'Next' 
                  : 'Complete Quiz',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsView() {
    final score = _calculateScore();
    final percentage = (score / widget.questions.length * 100).round();
    final passed = score >= 4; // Need 4/5 to pass

    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              passed ? Icons.celebration : Icons.refresh,
              size: 80,
              color: passed ? Colors.green[600] : Colors.orange[600],
            ),
            const SizedBox(height: 24),
            Text(
              passed ? 'Congratulations!' : 'Keep Practicing!',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                color: passed ? Colors.green[700] : Colors.orange[700],
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'You scored $score out of ${widget.questions.length} ($percentage%)',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              passed 
                  ? 'Great job! You\'ve mastered this lesson.'
                  : 'You need at least 4/5 correct to pass. Try again!',
              style: Theme.of(context).textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                if (!passed) ...[
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _retryQuiz,
                      icon: const Icon(Icons.refresh),
                      label: const Text('Try Again'),
                    ),
                  ),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // Close or navigate away
                    },
                    icon: const Icon(Icons.arrow_forward),
                    label: const Text('Continue'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _renderMathText(String text, {TextStyle? style}) {
    final mathRegex = RegExp(r'\$([^$]+)\$');
    final matches = mathRegex.allMatches(text);
    
    if (matches.isEmpty) {
      return Text(text, style: style);
    }

    List<InlineSpan> spans = [];
    int lastEnd = 0;

    for (final match in matches) {
      // Add text before the math
      if (match.start > lastEnd) {
        spans.add(TextSpan(
          text: text.substring(lastEnd, match.start),
          style: style,
        ));
      }

      // Add the math
      final mathContent = match.group(1)!;
      spans.add(WidgetSpan(
        child: Math.tex(
          mathContent,
          mathStyle: MathStyle.text,
          textStyle: style ?? const TextStyle(fontSize: 14),
        ),
      ));

      lastEnd = match.end;
    }

    // Add remaining text
    if (lastEnd < text.length) {
      spans.add(TextSpan(
        text: text.substring(lastEnd),
        style: style,
      ));
    }

    return RichText(
      text: TextSpan(
        children: spans,
        style: style ?? DefaultTextStyle.of(context).style,
      ),
    );
  }
}