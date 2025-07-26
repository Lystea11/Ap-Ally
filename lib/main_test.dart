import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'shared/services/supabase_service.dart';
import 'shared/themes/app_theme.dart';
import 'shared/services/ai_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase only for testing
  await SupabaseService.initialize();
  
  // Initialize AI Service
  AIService.initialize();
  
  runApp(
    const ProviderScope(
      child: TestApp(),
    ),
  );
}

class TestApp extends ConsumerWidget {
  const TestApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: 'AP-Ally Test',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const TestHomeScreen(),
    );
  }
}

class TestHomeScreen extends StatelessWidget {
  const TestHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AP-Ally Test'),
      ),
      body: const SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'AP-Ally',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 16),
              Text(
                'Test version - Supabase and AI services initialized successfully!',
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 32),
              Card(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      ListTile(
                        leading: Icon(Icons.check_circle, color: Colors.green),
                        title: Text('Supabase Service'),
                        subtitle: Text('Connected'),
                      ),
                      ListTile(
                        leading: Icon(Icons.check_circle, color: Colors.green),
                        title: Text('AI Service'),
                        subtitle: Text('Initialized'),
                      ),
                      ListTile(
                        leading: Icon(Icons.palette, color: Colors.blue),
                        title: Text('Theme System'),
                        subtitle: Text('Active'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}