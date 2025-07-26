class LessonModel {
  final String id;
  final String roadmapId;
  final String userUid;
  final String unitTitle;
  final String title;
  final Map<String, dynamic>? content;
  final bool completed;
  final bool mastery;
  final int? quizScore;
  final int unitOrder;
  final int lessonOrder;
  final DateTime createdAt;

  const LessonModel({
    required this.id,
    required this.roadmapId,
    required this.userUid,
    required this.unitTitle,
    required this.title,
    this.content,
    required this.completed,
    required this.mastery,
    this.quizScore,
    required this.unitOrder,
    required this.lessonOrder,
    required this.createdAt,
  });

  factory LessonModel.fromJson(Map<String, dynamic> json) {
    return LessonModel(
      id: json['id'] as String,
      roadmapId: json['roadmap_id'] as String,
      userUid: json['user_uid'] as String,
      unitTitle: json['unit_title'] as String,
      title: json['title'] as String,
      content: json['content'] != null 
          ? Map<String, dynamic>.from(json['content'] as Map)
          : null,
      completed: json['completed'] as bool,
      mastery: json['mastery'] as bool,
      quizScore: json['quiz_score'] as int?,
      unitOrder: json['unit_order'] as int,
      lessonOrder: json['lesson_order'] as int,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'roadmap_id': roadmapId,
      'user_uid': userUid,
      'unit_title': unitTitle,
      'title': title,
      'content': content,
      'completed': completed,
      'mastery': mastery,
      'quiz_score': quizScore,
      'unit_order': unitOrder,
      'lesson_order': lessonOrder,
      'created_at': createdAt.toIso8601String(),
    };
  }

  LessonModel copyWith({
    String? id,
    String? roadmapId,
    String? userUid,
    String? unitTitle,
    String? title,
    Map<String, dynamic>? content,
    bool? completed,
    bool? mastery,
    int? quizScore,
    int? unitOrder,
    int? lessonOrder,
    DateTime? createdAt,
  }) {
    return LessonModel(
      id: id ?? this.id,
      roadmapId: roadmapId ?? this.roadmapId,
      userUid: userUid ?? this.userUid,
      unitTitle: unitTitle ?? this.unitTitle,
      title: title ?? this.title,
      content: content ?? this.content,
      completed: completed ?? this.completed,
      mastery: mastery ?? this.mastery,
      quizScore: quizScore ?? this.quizScore,
      unitOrder: unitOrder ?? this.unitOrder,
      lessonOrder: lessonOrder ?? this.lessonOrder,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is LessonModel &&
        other.id == id &&
        other.roadmapId == roadmapId &&
        other.userUid == userUid &&
        other.unitTitle == unitTitle &&
        other.title == title &&
        other.completed == completed &&
        other.mastery == mastery &&
        other.quizScore == quizScore &&
        other.unitOrder == unitOrder &&
        other.lessonOrder == lessonOrder &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        roadmapId.hashCode ^
        userUid.hashCode ^
        unitTitle.hashCode ^
        title.hashCode ^
        completed.hashCode ^
        mastery.hashCode ^
        quizScore.hashCode ^
        unitOrder.hashCode ^
        lessonOrder.hashCode ^
        createdAt.hashCode;
  }

  @override
  String toString() {
    return 'LessonModel(id: $id, roadmapId: $roadmapId, userUid: $userUid, unitTitle: $unitTitle, title: $title, completed: $completed, mastery: $mastery, quizScore: $quizScore, unitOrder: $unitOrder, lessonOrder: $lessonOrder, createdAt: $createdAt)';
  }
}