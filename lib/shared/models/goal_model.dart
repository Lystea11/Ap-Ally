class GoalModel {
  final String id;
  final String userUid;
  final String text;
  final bool completed;
  final DateTime createdAt;

  const GoalModel({
    required this.id,
    required this.userUid,
    required this.text,
    required this.completed,
    required this.createdAt,
  });

  factory GoalModel.fromJson(Map<String, dynamic> json) {
    return GoalModel(
      id: json['id'] as String,
      userUid: json['user_uid'] as String,
      text: json['text'] as String,
      completed: json['completed'] as bool,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_uid': userUid,
      'text': text,
      'completed': completed,
      'created_at': createdAt.toIso8601String(),
    };
  }

  GoalModel copyWith({
    String? id,
    String? userUid,
    String? text,
    bool? completed,
    DateTime? createdAt,
  }) {
    return GoalModel(
      id: id ?? this.id,
      userUid: userUid ?? this.userUid,
      text: text ?? this.text,
      completed: completed ?? this.completed,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GoalModel &&
        other.id == id &&
        other.userUid == userUid &&
        other.text == text &&
        other.completed == completed &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        userUid.hashCode ^
        text.hashCode ^
        completed.hashCode ^
        createdAt.hashCode;
  }

  @override
  String toString() {
    return 'GoalModel(id: $id, userUid: $userUid, text: $text, completed: $completed, createdAt: $createdAt)';
  }
}