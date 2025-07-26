import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

final authStateProvider = StreamProvider<User?>((ref) {
  return AuthService.authStateChanges;
});

final userModelProvider = FutureProvider<UserModel?>((ref) async {
  final authState = ref.watch(authStateProvider);
  
  return authState.when(
    data: (user) {
      if (user != null) {
        return UserModel(
          uid: user.uid,
          email: user.email ?? '',
          createdAt: user.metadata.creationTime ?? DateTime.now(),
        );
      }
      return null;
    },
    loading: () => null,
    error: (_, __) => null,
  );
});

final authControllerProvider = Provider<AuthController>((ref) {
  return AuthController(ref);
});

class AuthController {
  AuthController(Ref ref);

  Future<UserCredential?> signInWithGoogle() async {
    try {
      return await AuthService.signInWithGoogle();
    } catch (e) {
      throw Exception('Failed to sign in with Google: $e');
    }
  }

  Future<void> signOut() async {
    try {
      await AuthService.signOut();
    } catch (e) {
      throw Exception('Failed to sign out: $e');
    }
  }

  Future<void> deleteAccount() async {
    try {
      await AuthService.deleteAccount();
    } catch (e) {
      throw Exception('Failed to delete account: $e');
    }
  }

  bool get isAuthenticated => AuthService.isAuthenticated;
  User? get currentUser => AuthService.currentUser;
  String? get currentUserId => AuthService.currentUserId;
}