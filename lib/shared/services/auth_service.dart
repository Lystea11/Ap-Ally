import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'supabase_service.dart';

class AuthService {
  static final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  static final GoogleSignIn _googleSignIn = GoogleSignIn();

  // Get current user
  static User? get currentUser => _firebaseAuth.currentUser;
  static String? get currentUserId => currentUser?.uid;
  static bool get isAuthenticated => currentUser != null;

  // Auth state stream
  static Stream<User?> get authStateChanges => _firebaseAuth.authStateChanges();

  // Sign in with Google
  static Future<UserCredential?> signInWithGoogle() async {
    try {
      // Trigger the authentication flow
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        return null; // User cancelled the sign-in
      }

      // Obtain the auth details from the request
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      // Create a new credential
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Sign in to Firebase with Google credentials
      final UserCredential userCredential = await _firebaseAuth.signInWithCredential(credential);

      // Create or update user in Supabase
      if (userCredential.user != null) {
        await _createOrUpdateSupabaseUser(userCredential.user!);
        
        // Sign in to Supabase with the same credentials
        await _signInToSupabase(userCredential.user!);
      }

      return userCredential;
    } on FirebaseAuthException catch (e) {
      print('Firebase Auth Error: ${e.message}');
      rethrow;
    } catch (e) {
      print('Google Sign In Error: $e');
      rethrow;
    }
  }

  // Sign out
  static Future<void> signOut() async {
    try {
      await Future.wait([
        _firebaseAuth.signOut(),
        _googleSignIn.signOut(),
        SupabaseService.client.auth.signOut(),
      ]);
    } catch (e) {
      print('Sign out error: $e');
      rethrow;
    }
  }

  // Create or update user in Supabase
  static Future<void> _createOrUpdateSupabaseUser(User firebaseUser) async {
    try {
      final userData = {
        'uid': firebaseUser.uid,
        'email': firebaseUser.email,
        'created_at': DateTime.now().toIso8601String(),
      };

      await SupabaseService.client
          .from(SupabaseService.usersTable)
          .upsert(userData, onConflict: 'uid');
    } catch (e) {
      print('Error creating/updating Supabase user: $e');
      rethrow;
    }
  }

  // Sign in to Supabase with Firebase user
  static Future<void> _signInToSupabase(User firebaseUser) async {
    try {
      // Note: Supabase doesn't have direct Firebase JWT integration
      // This would require custom implementation or alternative approach
    } catch (e) {
      print('Error signing in to Supabase: $e');
      // Don't rethrow here as Firebase auth was successful
    }
  }

  // Delete account
  static Future<void> deleteAccount() async {
    try {
      final user = currentUser;
      if (user == null) return;

      // Delete user data from Supabase
      await SupabaseService.client
          .from(SupabaseService.usersTable)
          .delete()
          .eq('uid', user.uid);

      // Delete Firebase account
      await user.delete();
      
      // Sign out from all services
      await signOut();
    } catch (e) {
      print('Error deleting account: $e');
      rethrow;
    }
  }

  // Reauthenticate user (required for sensitive operations)
  static Future<void> reauthenticate() async {
    try {
      final user = currentUser;
      if (user == null) return;

      // Get fresh Google credentials
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return;

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      // Reauthenticate
      await user.reauthenticateWithCredential(credential);
    } catch (e) {
      print('Reauthentication error: $e');
      rethrow;
    }
  }
}