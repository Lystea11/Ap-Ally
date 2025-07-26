import 'package:flutter/material.dart';
import '../../../../shared/models/ap_class_model.dart';
import '../../../../shared/models/lesson_model.dart';
import '../../../../shared/services/study_service.dart';
import '../../../lessons/presentation/screens/lesson_screen.dart';

class ClassDetailScreen extends StatelessWidget {
  final String classId;
  final APClassModel apClass;

  const ClassDetailScreen({
    super.key,
    required this.classId,
    required this.apClass,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(apClass.courseName),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Class header
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        apClass.courseName,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      if (apClass.testDate != null)
                        Text(
                          'Test Date: ${apClass.testDate!.month}/${apClass.testDate!.day}/${apClass.testDate!.year}',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      const SizedBox(height: 8),
                      Text(
                        'Created: ${apClass.createdAt.month}/${apClass.createdAt.day}/${apClass.createdAt.year}',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Study roadmap
              Text(
                'Study Roadmap',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),

              // Units and lessons list
              Expanded(
                child: Builder(
                  builder: (context) {
                    print('🔍 DEBUG: ClassDetailScreen - apClass.id: ${apClass.id}');
                    print('🔍 DEBUG: ClassDetailScreen - apClass.courseName: ${apClass.courseName}');

                    return FutureBuilder<Map<String, List<LessonModel>>>(
                      future: StudyService().getLessonsGroupedByUnit(apClass.id),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState == ConnectionState.waiting) {
                          return const Center(child: CircularProgressIndicator());
                        }

                        if (snapshot.hasError) {
                          return Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.error_outline,
                                  size: 64,
                                  color: Colors.red[300],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Error loading lessons',
                                  style: Theme.of(context).textTheme.titleMedium,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  snapshot.error.toString(),
                                  style: Theme.of(context).textTheme.bodySmall,
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          );
                        }

                        final lessonsGrouped = snapshot.data ?? {};

                        if (lessonsGrouped.isEmpty) {
                          return Center(
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
                                  'No lessons available',
                                  style: Theme.of(context).textTheme.titleMedium,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Lessons will appear here once your roadmap is created',
                                  style: Theme.of(context).textTheme.bodyMedium,
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          );
                        }

                        final units = lessonsGrouped.keys.toList();

                        return ListView.builder(
                          itemCount: units.length,
                          itemBuilder: (context, index) {
                            final unitTitle = units[index];
                            final lessons = lessonsGrouped[unitTitle]!;
                            final completedLessons = lessons.where((l) => l.completed).length;

                            return Card(
                              margin: const EdgeInsets.only(bottom: 8),
                              child: ExpansionTile(
                                leading: CircleAvatar(
                                  backgroundColor: Theme.of(context).primaryColor,
                                  child: Text('${index + 1}'),
                                ),
                                title: Text(unitTitle),
                                subtitle: Text('${lessons.length} lessons • $completedLessons completed'),
                                children: lessons.map((lesson) {
                                  return ListTile(
                                    leading: Icon(
                                      lesson.completed
                                          ? Icons.check_circle
                                          : Icons.radio_button_unchecked,
                                      color: lesson.completed
                                          ? Colors.green
                                          : Colors.grey,
                                    ),
                                    title: Text(lesson.title),
                                    subtitle: Text(
                                      lesson.completed
                                          ? lesson.mastery
                                              ? "Completed • Mastered"
                                              : "Completed • Not Mastered"
                                          : "Not started",
                                    ),
                                    trailing: lesson.completed
                                        ? Icon(
                                            lesson.mastery
                                                ? Icons.star
                                                : Icons.star_outline,
                                            color: lesson.mastery
                                                ? Colors.amber
                                                : Colors.grey,
                                          )
                                        : null,
                                    onTap: () {
                                      // Navigate to lesson
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => LessonScreen(
                                            lessonId: lesson.id,
                                          ),
                                        ),
                                      );
                                    },
                                  );
                                }).toList(),
                              ),
                            );
                          },
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // Start study session
        },
        label: const Text('Continue Studying'),
        icon: const Icon(Icons.play_arrow),
      ),
    );
  }
}