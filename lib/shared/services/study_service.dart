import '../models/ap_class_model.dart';
import '../models/lesson_model.dart';
import '../models/goal_model.dart';
import 'supabase_service.dart';

class StudyService {
  Future<List<APClassModel>> getUserAPClasses(String userId) async {
    try {
      final response = await SupabaseService.select(SupabaseService.apClassesTable)
          .eq('user_uid', userId)
          .order('created_at');

      final List<dynamic> data = response as List<dynamic>;
      return data.map((json) => APClassModel.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to fetch AP classes: $e');
    }
  }

  Future<void> createAPClass(APClassModel apClass) async {
    try {
      await SupabaseService.insert(SupabaseService.apClassesTable, apClass.toJson());
    } catch (e) {
      throw Exception('Failed to create AP class: $e');
    }
  }

  Future<void> updateAPClass(String id, Map<String, dynamic> updates) async {
    try {
      await SupabaseService.update(SupabaseService.apClassesTable, updates)
          .eq('id', id);
    } catch (e) {
      throw Exception('Failed to update AP class: $e');
    }
  }

  Future<void> deleteAPClass(String id) async {
    try {
      await SupabaseService.delete(SupabaseService.apClassesTable)
          .eq('id', id);
    } catch (e) {
      throw Exception('Failed to delete AP class: $e');
    }
  }

  Future<Map<String, dynamic>?> getRoadmapByClassId(String apClassId) async {
    try {
      print('🔍 DEBUG: Looking for roadmap with ap_class_id: $apClassId');
      
      final response = await SupabaseService.select(SupabaseService.roadmapsTable)
          .eq('ap_class_id', apClassId)
          .order('created_at', ascending: false);

      print('🔍 DEBUG: Supabase response type: ${response.runtimeType}');
      print('🔍 DEBUG: Supabase response: $response');

      final List<dynamic> data = response as List<dynamic>;
      
      print('🔍 DEBUG: Found ${data.length} roadmaps');
      
      if (data.isEmpty) {
        print('🔍 DEBUG: No roadmaps found for ap_class_id: $apClassId');
        return null; // No roadmaps found
      }
      
      // Return the most recent roadmap
      final roadmap = data.first as Map<String, dynamic>;
      print('🔍 DEBUG: Returning roadmap with id: ${roadmap['id']}');
      return roadmap;
    } catch (e) {
      print('🔍 DEBUG: Error in getRoadmapByClassId: $e');
      throw Exception('Failed to fetch roadmap for ap_class_id $apClassId: $e');
    }
  }

  Future<List<LessonModel>> getLessonsByRoadmap(String roadmapId) async {
    try {
      print('🔍 DEBUG: Looking for lessons with roadmap_id: $roadmapId');
      
      final response = await SupabaseService.select(SupabaseService.lessonsTable)
          .eq('roadmap_id', roadmapId)
          .order('unit_order')
          .order('lesson_order');

      print('🔍 DEBUG: Lessons response type: ${response.runtimeType}');
      print('🔍 DEBUG: Lessons response: $response');

      if (response == null) {
        print('🔍 DEBUG: Lessons response is null, returning empty list');
        return [];
      }

      final List<dynamic> data = response as List<dynamic>;
      print('🔍 DEBUG: Found ${data.length} lessons');
      
      return data.map((json) => LessonModel.fromJson(json)).toList();
    } catch (e) {
      print('🔍 DEBUG: Error in getLessonsByRoadmap: $e');
      throw Exception('Failed to fetch lessons for roadmap_id $roadmapId: $e');
    }
  }

  Future<Map<String, List<LessonModel>>> getLessonsGroupedByUnit(String apClassId) async {
    try {
      print('🔍 DEBUG: getLessonsGroupedByUnit called with apClassId: $apClassId');
      
      final roadmap = await getRoadmapByClassId(apClassId);
      
      if (roadmap == null) {
        print('🔍 DEBUG: No roadmap found, returning empty map');
        // No roadmap found for this class, return empty map
        return {};
      }
      
      print('🔍 DEBUG: Found roadmap, getting lessons for roadmap_id: ${roadmap['id']}');
      final lessons = await getLessonsByRoadmap(roadmap['id']);
      
      print('🔍 DEBUG: Found ${lessons.length} lessons');
      
      final Map<String, List<LessonModel>> groupedLessons = {};
      for (final lesson in lessons) {
        if (!groupedLessons.containsKey(lesson.unitTitle)) {
          groupedLessons[lesson.unitTitle] = [];
        }
        groupedLessons[lesson.unitTitle]!.add(lesson);
      }
      
      print('🔍 DEBUG: Grouped lessons into ${groupedLessons.keys.length} units');
      return groupedLessons;
    } catch (e) {
      print('🔍 DEBUG: Error in getLessonsGroupedByUnit: $e');
      throw Exception('Failed to fetch lessons grouped by unit for ap_class_id $apClassId: $e');
    }
  }

  Future<List<LessonModel>> getAllLessons() async {
    try {
      final response = await SupabaseService.select(SupabaseService.lessonsTable)
          .order('unit_order')
          .order('lesson_order');

      final List<dynamic> data = response as List<dynamic>;
      return data.map((json) => LessonModel.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to fetch all lessons: $e');
    }
  }

  Future<LessonModel?> getLessonById(String lessonId) async {
    try {
      final response = await SupabaseService.select(SupabaseService.lessonsTable)
          .eq('id', lessonId)
          .single();

      if (response == null) return null;
      return LessonModel.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      throw Exception('Failed to fetch lesson: $e');
    }
  }

  Future<void> updateLesson(LessonModel lesson) async {
    try {
      await SupabaseService.update(SupabaseService.lessonsTable, lesson.toJson())
          .eq('id', lesson.id);
    } catch (e) {
      throw Exception('Failed to update lesson: $e');
    }
  }

  Future<void> updateLessonProgress(String lessonId, bool completed, bool mastery) async {
    try {
      await SupabaseService.update(SupabaseService.lessonsTable, {
        'completed': completed,
        'mastery': mastery,
      }).eq('id', lessonId);
    } catch (e) {
      throw Exception('Failed to update lesson progress: $e');
    }
  }

  Future<List<GoalModel>> getUserGoals(String userId) async {
    try {
      final response = await SupabaseService.select(SupabaseService.goalsTable)
          .eq('user_uid', userId)
          .order('created_at', ascending: false);

      final List<dynamic> data = response as List<dynamic>;
      return data.map((json) => GoalModel.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to fetch goals: $e');
    }
  }

  Future<void> createGoal(GoalModel goal) async {
    try {
      await SupabaseService.insert(SupabaseService.goalsTable, goal.toJson());
    } catch (e) {
      throw Exception('Failed to create goal: $e');
    }
  }

  Future<void> updateGoal(String goalId, Map<String, dynamic> updates) async {
    try {
      await SupabaseService.update(SupabaseService.goalsTable, updates)
          .eq('id', goalId);
    } catch (e) {
      throw Exception('Failed to update goal: $e');
    }
  }

  Future<void> deleteGoal(String goalId) async {
    try {
      await SupabaseService.delete(SupabaseService.goalsTable)
          .eq('id', goalId);
    } catch (e) {
      throw Exception('Failed to delete goal: $e');
    }
  }
}