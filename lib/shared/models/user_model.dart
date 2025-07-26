class UserModel {
  final String uid;
  final String email;
  final DateTime createdAt;

  const UserModel({
    required this.uid,
    required this.email,
    required this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      uid: json['uid'] as String,
      email: json['email'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'uid': uid,
      'email': email,
      'created_at': createdAt.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? uid,
    String? email,
    DateTime? createdAt,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserModel &&
        other.uid == uid &&
        other.email == email &&
        other.createdAt == createdAt;
  }

  @override
  int get hashCode => uid.hashCode ^ email.hashCode ^ createdAt.hashCode;

  @override
  String toString() {
    return 'UserModel(uid: $uid, email: $email, createdAt: $createdAt)';
  }
}