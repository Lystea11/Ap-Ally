class APClassModel {
  final String id;
  final String userUid;
  final String courseName;
  final DateTime? testDate;
  final DateTime createdAt;

  const APClassModel({
    required this.id,
    required this.userUid,
    required this.courseName,
    this.testDate,
    required this.createdAt,
  });

  factory APClassModel.fromJson(Map<String, dynamic> json) {
    return APClassModel(
      id: json['id'] as String,
      userUid: json['user_uid'] as String,
      courseName: json['course_name'] as String,
      testDate: json['test_date'] != null 
          ? DateTime.parse(json['test_date'] as String)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_uid': userUid,
      'course_name': courseName,
      'test_date': testDate?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  APClassModel copyWith({
    String? id,
    String? userUid,
    String? courseName,
    DateTime? testDate,
    DateTime? createdAt,
  }) {
    return APClassModel(
      id: id ?? this.id,
      userUid: userUid ?? this.userUid,
      courseName: courseName ?? this.courseName,
      testDate: testDate ?? this.testDate,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is APClassModel &&
        other.id == id &&
        other.userUid == userUid &&
        other.courseName == courseName &&
        other.testDate == testDate &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode {
    return id.hashCode ^
        userUid.hashCode ^
        courseName.hashCode ^
        testDate.hashCode ^
        createdAt.hashCode;
  }

  @override
  String toString() {
    return 'APClassModel(id: $id, userUid: $userUid, courseName: $courseName, testDate: $testDate, createdAt: $createdAt)';
  }
}