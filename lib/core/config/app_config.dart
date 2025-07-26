class AppConfig {
  static const String appName = 'AP-Ally';
  static const String appVersion = '1.0.0';
  
  // Firebase Configuration
  static const String firebaseApiKey = "AIzaSyDAJIOU1JcpwsAIKr7YtErAxe-Rbuotxnw";
  static const String firebaseAppId = "1:1073849435965:web:4ac725ffe265c5b976e754";
  static const String firebaseIosAppId = "1:1073849435965:ios:b233d356e5deb3c676e754";
  static const String firebaseIosApiKey = "AIzaSyBQj7Ar8m04H-s3Bt1XyxoTKBg_bmqaWm0";
  static const String firebaseMessagingSenderId = "1073849435965";
  static const String firebaseProjectId = "ap-ally-76ca5";
  static const String firebaseAuthDomain = "ap-ally-76ca5.firebaseapp.com";
  static const String firebaseStorageBucket = "ap-ally-76ca5.firebasestorage.app";
  
  // Supabase Configuration
  static const String supabaseUrl = "https://efauaskwaakrjrfwzofq.supabase.co";
  static const String supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmYXVhc2t3YWFrcmpyZnd6b2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NDg4MzUsImV4cCI6MjA2NzEyNDgzNX0.Yc8PwiqDoklMpeyjlxmHHOocL7TQFw6PqQgxZVbibJY';
  
  // Google AI Configuration
  static const String geminiApiKey = 'AIzaSyA5NVM_jfukStJ647X9_jPSOj_6JYk5AZU';
  
  // App Configuration
  static const bool isDebugMode = true;
  static const int sessionTimeoutMinutes = 30;
  static const int maxRetryAttempts = 3;
}