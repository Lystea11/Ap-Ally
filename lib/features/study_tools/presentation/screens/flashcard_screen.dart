import 'package:flutter/material.dart';

class FlashcardScreen extends StatelessWidget {
  final String lessonId;
  
  const FlashcardScreen({
    super.key,
    required this.lessonId,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flashcards'),
        actions: [
          IconButton(
            onPressed: () {
              // Settings
            },
            icon: const Icon(Icons.settings),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Progress indicator
              Text(
                'Card 1 of 20',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              LinearProgressIndicator(
                value: 0.05,
                backgroundColor: Colors.grey[300],
              ),
              const SizedBox(height: 24),
              
              // Flashcard
              Expanded(
                child: GestureDetector(
                  onTap: () {
                    // Flip card
                  },
                  child: Card(
                    elevation: 4,
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.flip,
                            size: 48,
                            color: Colors.grey[400],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'What is the definition of...',
                            style: Theme.of(context).textTheme.headlineSmall,
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 24),
                          Text(
                            'Tap to reveal answer',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[600],
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              
              // Control buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  FloatingActionButton(
                    heroTag: 'hard',
                    backgroundColor: Colors.red,
                    onPressed: () {
                      // Mark as hard
                    },
                    child: const Icon(Icons.close),
                  ),
                  FloatingActionButton(
                    heroTag: 'medium',
                    backgroundColor: Colors.orange,
                    onPressed: () {
                      // Mark as medium
                    },
                    child: const Icon(Icons.remove),
                  ),
                  FloatingActionButton(
                    heroTag: 'easy',
                    backgroundColor: Colors.green,
                    onPressed: () {
                      // Mark as easy
                    },
                    child: const Icon(Icons.check),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}