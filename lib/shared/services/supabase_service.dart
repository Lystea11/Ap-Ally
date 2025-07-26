import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/app_config.dart';

class SupabaseService {
  static SupabaseClient? _client;
  
  static SupabaseClient get client {
    if (_client == null) {
      throw Exception('Supabase client not initialized. Call initialize() first.');
    }
    return _client!;
  }

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: AppConfig.supabaseUrl,
      anonKey: AppConfig.supabaseAnonKey,
      debug: AppConfig.isDebugMode,
    );
    _client = Supabase.instance.client;
  }

  // Database table names
  static const String usersTable = 'users';
  static const String apClassesTable = 'ap_classes';
  static const String roadmapsTable = 'roadmaps';
  static const String lessonsTable = 'lessons';
  static const String courseMasteryTable = 'course_mastery';
  static const String goalsTable = 'goals';
  static const String onboardingQuizResultsTable = 'onboarding_quiz_results';
  static const String practiceQuizResultsTable = 'practice_quiz_results';
  static const String flashcardsTable = 'flashcards';

  // Auth helper methods
  static User? get currentUser => client.auth.currentUser;
  static String? get currentUserId => currentUser?.id;
  static bool get isAuthenticated => currentUser != null;

  // Database query helpers
  static SupabaseQueryBuilder from(String table) => client.from(table);
  
  static PostgrestFilterBuilder select(String table, [String columns = '*']) {
    return client.from(table).select(columns);
  }

  static PostgrestFilterBuilder insert(String table, Map<String, dynamic> data) {
    return client.from(table).insert(data);
  }

  static PostgrestFilterBuilder update(String table, Map<String, dynamic> data) {
    return client.from(table).update(data);
  }

  static PostgrestFilterBuilder delete(String table) {
    return client.from(table).delete();
  }
}