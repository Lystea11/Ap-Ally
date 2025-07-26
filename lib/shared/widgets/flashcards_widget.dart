import 'package:flutter/material.dart';
import 'package:flutter_card_swiper/flutter_card_swiper.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import '../models/lesson_content_models.dart';

class FlashcardsWidget extends StatefulWidget {
  final List<Flashcard> flashcards;

  const FlashcardsWidget({
    super.key,
    required this.flashcards,
  });

  @override
  State<FlashcardsWidget> createState() => _FlashcardsWidgetState();
}

class _FlashcardsWidgetState extends State<FlashcardsWidget>
    with TickerProviderStateMixin {
  final CardSwiperController _swiperController = CardSwiperController();
  int _currentIndex = 0;
  bool _showAnswer = false;
  late AnimationController _flipAnimationController;
  late Animation<double> _flipAnimation;
  List<bool> _masteredCards = [];

  @override
  void initState() {
    super.initState();
    _masteredCards = List.filled(widget.flashcards.length, false);
    
    _flipAnimationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _flipAnimation = CurvedAnimation(
      parent: _flipAnimationController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _flipAnimationController.dispose();
    super.dispose();
  }

  void _flipCard() {
    if (_showAnswer) {
      _flipAnimationController.reverse().then((_) {
        setState(() {
          _showAnswer = false;
        });
      });
    } else {
      setState(() {
        _showAnswer = true;
      });
      _flipAnimationController.forward();
    }
  }

  void _nextCard() {
    if (_currentIndex < widget.flashcards.length - 1) {
      _swiperController.swipe(CardSwiperDirection.right);
    } else {
      _showCompletionDialog();
    }
  }

  void _previousCard() {
    if (_currentIndex > 0) {
      _swiperController.swipe(CardSwiperDirection.left);
    }
  }

  void _markAsMastered(bool mastered) {
    setState(() {
      _masteredCards[_currentIndex] = mastered;
    });
    
    if (mastered) {
      // Auto-advance to next card after marking as mastered
      Future.delayed(const Duration(milliseconds: 500), () {
        _nextCard();
      });
    }
  }

  void _resetCardStack() {
    setState(() {
      _currentIndex = 0;
      _showAnswer = false;
      _masteredCards = List.filled(widget.flashcards.length, false);
    });
    _flipAnimationController.reset();
  }

  void _showCompletionDialog() {
    final masteredCount = _masteredCards.where((m) => m).length;
    final totalCount = widget.flashcards.length;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Flashcards Complete!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.celebration,
              size: 60,
              color: Theme.of(context).primaryColor,
            ),
            const SizedBox(height: 16),
            Text(
              'You\'ve reviewed all $totalCount flashcards!',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Mastered: $masteredCount/$totalCount',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _resetCardStack();
            },
            child: const Text('Study Again'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.flashcards.isEmpty) {
      return const Center(
        child: Text('No flashcards available.'),
      );
    }

    return Column(
      children: [
        // Progress indicator
        _buildProgressIndicator(),
        
        // Card stack
        Expanded(
          child: CardSwiper(
            controller: _swiperController,
            cardsCount: widget.flashcards.length,
            onSwipe: (previousIndex, currentIndex, direction) {
              setState(() {
                _currentIndex = currentIndex ?? 0;
                _showAnswer = false;
              });
              _flipAnimationController.reset();
              return true;
            },
            cardBuilder: (context, index, horizontalThreshold, verticalThreshold) {
              return _buildFlashcard(widget.flashcards[index], index);
            },
            numberOfCardsDisplayed: 3,
            backCardOffset: const Offset(0, 20),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          ),
        ),

        // Controls
        _buildControls(),
      ],
    );
  }

  Widget _buildProgressIndicator() {
    final masteredCount = _masteredCards.where((m) => m).length;
    
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Card ${_currentIndex + 1} of ${widget.flashcards.length}',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.star,
                      size: 16,
                      color: Theme.of(context).primaryColor,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Mastered: $masteredCount',
                      style: TextStyle(
                        color: Theme.of(context).primaryColor,
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: (_currentIndex + 1) / widget.flashcards.length,
            backgroundColor: Colors.grey[300],
            valueColor: AlwaysStoppedAnimation<Color>(
              Theme.of(context).primaryColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFlashcard(Flashcard flashcard, int index) {
    return AnimatedBuilder(
      animation: _flipAnimation,
      builder: (context, child) {
        final isFlipped = _flipAnimation.value >= 0.5;
        
        return Transform(
          alignment: Alignment.center,
          transform: Matrix4.identity()
            ..setEntry(3, 2, 0.001)
            ..rotateY(_flipAnimation.value * 3.14159),
          child: Card(
            elevation: 8,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            child: Container(
              width: double.infinity,
              height: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: _showAnswer
                      ? [Colors.blue[50]!, Colors.blue[100]!]
                      : [Colors.purple[50]!, Colors.purple[100]!],
                ),
              ),
              child: Transform(
                alignment: Alignment.center,
                transform: Matrix4.identity()
                  ..rotateY(isFlipped ? 3.14159 : 0),
                child: _showAnswer
                    ? _buildAnswerSide(flashcard, index)
                    : _buildQuestionSide(flashcard, index),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildQuestionSide(Flashcard flashcard, int index) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Question header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.purple[600],
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'QUESTION',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const Spacer(),
              if (_masteredCards[index])
                Icon(
                  Icons.star,
                  color: Colors.amber[600],
                  size: 24,
                ),
            ],
          ),
          
          // Question content
          Expanded(
            child: Center(
              child: SingleChildScrollView(
                child: _renderMathText(
                  flashcard.question,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w500,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),

          // Tap to reveal hint
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.7),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.touch_app,
                  size: 16,
                  color: Colors.grey[600],
                ),
                const SizedBox(width: 8),
                Text(
                  'Tap to reveal answer',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnswerSide(Flashcard flashcard, int index) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Answer header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.blue[600],
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'ANSWER',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const Spacer(),
              if (_masteredCards[index])
                Icon(
                  Icons.star,
                  color: Colors.amber[600],
                  size: 24,
                ),
            ],
          ),
          
          // Answer content
          Expanded(
            child: Center(
              child: SingleChildScrollView(
                child: _renderMathText(
                  flashcard.answer,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),

          // Mastery buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _markAsMastered(false),
                  icon: const Icon(Icons.replay),
                  label: const Text('Study Again'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.orange[600],
                    side: BorderSide(color: Colors.orange[300]!),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _markAsMastered(true),
                  icon: const Icon(Icons.star),
                  label: const Text('Mastered'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green[600],
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildControls() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Flip card button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _flipCard,
              icon: Icon(_showAnswer ? Icons.visibility_off : Icons.visibility),
              label: Text(_showAnswer ? 'Hide Answer' : 'Show Answer'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Theme.of(context).primaryColor,
                foregroundColor: Colors.white,
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Navigation buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _currentIndex > 0 ? _previousCard : null,
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Previous'),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _nextCard,
                  icon: Icon(
                    _currentIndex < widget.flashcards.length - 1
                        ? Icons.arrow_forward
                        : Icons.check,
                  ),
                  label: Text(
                    _currentIndex < widget.flashcards.length - 1
                        ? 'Next'
                        : 'Complete',
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _renderMathText(String text, {TextStyle? style, TextAlign? textAlign}) {
    final mathRegex = RegExp(r'\$([^$]+)\$');
    final matches = mathRegex.allMatches(text);
    
    if (matches.isEmpty) {
      return Text(
        text,
        style: style,
        textAlign: textAlign,
      );
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
      textAlign: textAlign ?? TextAlign.start,
    );
  }
}