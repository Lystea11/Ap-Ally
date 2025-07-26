import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../shared/providers/auth_provider.dart';
import '../../features/auth/presentation/screens/landing_screen.dart';
import '../../features/auth/presentation/screens/sign_in_screen.dart';
import '../../features/onboarding/presentation/screens/onboarding_screen.dart';
import '../../features/dashboard/presentation/screens/dashboard_screen.dart';
// import '../../features/classes/presentation/screens/class_detail_screen.dart';
import '../../features/lessons/presentation/screens/lesson_screen.dart';
import '../../features/study_tools/presentation/screens/flashcard_screen.dart';
import '../../features/study_tools/presentation/screens/quiz_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isAuthenticated = authState.valueOrNull != null;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');
      
      // If not authenticated and not on auth route, redirect to landing
      if (!isAuthenticated && !isAuthRoute) {
        return '/auth/landing';
      }
      
      // If authenticated and on auth route, redirect to dashboard
      if (isAuthenticated && isAuthRoute) {
        return '/dashboard';
      }
      
      return null; // No redirect needed
    },
    routes: [
      // Auth routes
      GoRoute(
        path: '/auth/landing',
        name: 'landing',
        builder: (context, state) => const LandingScreen(),
      ),
      GoRoute(
        path: '/auth/signin',
        name: 'signin',
        builder: (context, state) => const SignInScreen(),
      ),
      
      // Onboarding routes
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      
      // Main app routes
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/class/:classId',
        name: 'classDetail',
        builder: (context, state) {
          // Note: This route requires an APClassModel which cannot be passed via URL
          // Consider using a state management solution or fetching the class data here
          throw UnimplementedError('Use direct navigation with Navigator.push instead');
        },
      ),
      GoRoute(
        path: '/lesson/:lessonId',
        name: 'lesson',
        builder: (context, state) {
          final lessonId = state.pathParameters['lessonId']!;
          return LessonScreen(lessonId: lessonId);
        },
      ),
      
      // Study tools routes
      GoRoute(
        path: '/flashcards/:lessonId',
        name: 'flashcards',
        builder: (context, state) {
          final lessonId = state.pathParameters['lessonId']!;
          return FlashcardScreen(lessonId: lessonId);
        },
      ),
      GoRoute(
        path: '/quiz/:classId',
        name: 'quiz',
        builder: (context, state) {
          final classId = state.pathParameters['classId']!;
          return QuizScreen(classId: classId);
        },
      ),
      
      // Default redirect to dashboard
      GoRoute(
        path: '/',
        redirect: (context, state) => '/dashboard',
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'The page you are looking for does not exist.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/dashboard'),
              child: const Text('Go to Dashboard'),
            ),
          ],
        ),
      ),
    ),
  );
});