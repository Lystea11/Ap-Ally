import 'package:flutter/material.dart';

class QuizScreen extends StatelessWidget {
  final String classId;
  
  const QuizScreen({
    super.key,
    required this.classId,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Practice Quiz'),
        actions: [
          IconButton(
            onPressed: () {
              // Show timer/settings
            },
            icon: const Icon(Icons.timer),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Quiz header
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Question 1 of 10',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 8),
                      LinearProgressIndicator(
                        value: 0.1,
                        backgroundColor: Colors.grey[300],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Time remaining: 45:30',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Question
              Text(
                'Question',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    'What is the primary function of mitochondria in cellular respiration?',
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Answer choices
              Text(
                'Choose the best answer:',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 16),
              
              Expanded(
                child: ListView.builder(
                  itemCount: 4,
                  itemBuilder: (context, index) {
                    final choices = ['A', 'B', 'C', 'D'];
                    final answers = [
                      'To produce ATP through oxidative phosphorylation',
                      'To synthesize proteins for the cell',
                      'To store genetic information',
                      'To regulate cell division',
                    ];
                    
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: RadioListTile<int>(
                        value: index,
                        groupValue: -1, // No selection
                        onChanged: (value) {
                          // Handle selection
                        },
                        title: Text('${choices[index]}. ${answers[index]}'),
                      ),
                    );
                  },
                ),
              ),
              
              // Navigation buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  OutlinedButton(
                    onPressed: () {
                      // Previous question
                    },
                    child: const Text('Previous'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      // Next question
                    },
                    child: const Text('Next'),
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