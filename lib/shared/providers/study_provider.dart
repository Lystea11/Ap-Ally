import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/ap_class_model.dart';
import '../models/lesson_model.dart';
import '../models/goal_model.dart';
import '../services/study_service.dart';

final apClassesProvider = FutureProvider.family<List<APClassModel>, String>((ref, userId) async {
  final studyService = ref.watch(studyServiceProvider);
  return await studyService.getUserAPClasses(userId);
});

final lessonsProvider = FutureProvider.family<List<LessonModel>, String>((ref, roadmapId) async {
  final studyService = ref.watch(studyServiceProvider);
  return await studyService.getLessonsByRoadmap(roadmapId);
});

final goalsProvider = FutureProvider.family<List<GoalModel>, String>((ref, userId) async {
  final studyService = ref.watch(studyServiceProvider);
  return await studyService.getUserGoals(userId);
});

final currentLessonProvider = StateProvider<LessonModel?>((ref) => null);

final studyServiceProvider = Provider<StudyService>((ref) {
  return StudyService();
});

final studyControllerProvider = Provider<StudyController>((ref) {
  return StudyController(ref);
});

class StudyController {
  final Ref _ref;
  
  StudyController(this._ref);

  Future<void> createAPClass(APClassModel apClass) async {
    final studyService = _ref.read(studyServiceProvider);
    await studyService.createAPClass(apClass);
    
    _ref.invalidate(apClassesProvider);
  }

  Future<void> updateLessonProgress(String lessonId, bool completed, bool mastery) async {
    final studyService = _ref.read(studyServiceProvider);
    await studyService.updateLessonProgress(lessonId, completed, mastery);
    
    _ref.invalidate(lessonsProvider);
  }

  Future<void> createGoal(GoalModel goal) async {
    final studyService = _ref.read(studyServiceProvider);
    await studyService.createGoal(goal);
    
    _ref.invalidate(goalsProvider);
  }

  Future<void> toggleGoalCompletion(String goalId, bool completed) async {
    final studyService = _ref.read(studyServiceProvider);
    await studyService.updateGoal(goalId, {'completed': completed});
    
    _ref.invalidate(goalsProvider);
  }

  void setCurrentLesson(LessonModel? lesson) {
    _ref.read(currentLessonProvider.notifier).state = lesson;
  }

  LessonModel? getCurrentLesson() {
    return _ref.read(currentLessonProvider);
  }
}