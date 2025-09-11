"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useStudy } from "@/hooks/useStudy";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, Target, BookOpen, TrendingUp, Users, ArrowRight, GraduationCap, UserPlus } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { createClassAPI } from "@/lib/api-client";
import { GuestSessionManager } from "@/lib/guest-session";
import type { Roadmap } from "@/lib/types";

interface GuestRoadmapRecapProps {
  roadmap: Roadmap;
  quizResults: string;
  isCustomFlow: boolean;
  apCourse: string;
  testDate?: Date;
}

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  priorityUnits: string[];
  recommendedStartingPoint: string;
  totalLessons: number;
  estimatedWeeks: number;
}

export function GuestRoadmapRecap({ roadmap, quizResults, isCustomFlow, apCourse, testDate }: GuestRoadmapRecapProps) {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const { setRoadmap } = useStudy();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const analysis = useMemo((): AnalysisResult => {
    if (isCustomFlow || !quizResults) {
      // For custom flow, provide generic analysis
      const totalLessons = roadmap.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
      const estimatedWeeks = Math.ceil(totalLessons / 3);
      
      return {
        strengths: ["Self-directed learning", "Clear study goals"],
        weaknesses: ["Areas for focused improvement"],
        priorityUnits: [roadmap.units[0]?.title || "First unit"],
        recommendedStartingPoint: roadmap.units[0]?.title || "Begin with the first unit",
        totalLessons,
        estimatedWeeks
      };
    }

    // Parse quiz results to identify patterns
    const questions = quizResults.split("\n\n");
    
    // Extract units and performance (simplified analysis)
    const unitPerformance: Record<string, { correct: number; total: number }> = {};
    const skillPerformance: Record<string, { correct: number; total: number }> = {};
    
    questions.forEach(questionBlock => {
      const lines = questionBlock.split("\n");
      const unitMatch = lines.find(line => line.startsWith("Unit:"));
      const skillMatch = lines.find(line => line.startsWith("Skill:"));
      const answerMatch = lines.find(line => line.startsWith("Answer:"));
      
      if (unitMatch && skillMatch && answerMatch) {
        const unit = unitMatch.replace("Unit:", "").trim();
        const skill = skillMatch.replace("Skill:", "").trim();
        
        // Initialize tracking
        if (!unitPerformance[unit]) {
          unitPerformance[unit] = { correct: 0, total: 0 };
        }
        if (!skillPerformance[skill]) {
          skillPerformance[skill] = { correct: 0, total: 0 };
        }
        
        unitPerformance[unit].total++;
        skillPerformance[skill].total++;
        
        // Simple heuristic: assume longer, more detailed answers indicate better understanding
        const answer = answerMatch.replace("Answer:", "").trim();
        if (answer.length > 10) { // Basic performance indicator
          unitPerformance[unit].correct++;
          skillPerformance[skill].correct++;
        }
      }
    });
    
    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const priorityUnits: string[] = [];
    
    Object.entries(unitPerformance).forEach(([unit, performance]) => {
      const percentage = performance.total > 0 ? (performance.correct / performance.total) * 100 : 0;
      if (percentage >= 70) {
        strengths.push(unit);
      } else if (percentage <= 40) {
        weaknesses.push(unit);
        priorityUnits.push(unit);
      }
    });
    
    // Find recommended starting point
    const firstWeakUnit = roadmap.units.find(unit => 
      weaknesses.some(weakness => unit.title.toLowerCase().includes(weakness.toLowerCase()))
    );
    
    const recommendedStartingPoint = firstWeakUnit 
      ? firstWeakUnit.title 
      : roadmap.units[0]?.title || "Begin with the first unit";
    
    // Calculate metrics
    const totalLessons = roadmap.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
    const estimatedWeeks = Math.ceil(totalLessons / 3); // Assume 3 lessons per week
    
    return {
      strengths: strengths.length > 0 ? strengths : ["Problem-solving approach", "Basic concepts"],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["Advanced applications", "Complex analysis"],
      priorityUnits: priorityUnits.length > 0 ? priorityUnits : [roadmap.units[0]?.title || "First unit"],
      recommendedStartingPoint,
      totalLessons,
      estimatedWeeks
    };
  }, [roadmap, quizResults, isCustomFlow]);

  const handleSignUpAndStart = async () => {
    if (isAuthenticated) {
      // User is already authenticated, create class and start journey
      await handleStartAuthenticatedJourney();
      return;
    }

    setLoading(true);
    try {
      await login();
      // After successful login, the effect in login will handle the redirect
      // But we'll also handle it here in case
      setTimeout(async () => {
        try {
          await handleStartAuthenticatedJourney();
        } catch (error) {
          console.error("Failed to start journey after login:", error);
          toast({
            title: "Error",
            description: "Could not start your study journey. Please try again.",
            variant: "destructive",
          });
        }
      }, 1000);
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Sign Up Required",
        description: "Please sign up to access your personalized study course.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartAuthenticatedJourney = async () => {
    setLoading(true);
    try {
      // Create the class
      const newClass = await createClassAPI(apCourse, testDate?.toISOString());
      
      // Save the roadmap
      await setRoadmap(roadmap, newClass.id);
      
      // Clear guest data
      GuestSessionManager.clearData();
      
      // Navigate to dashboard
      router.push(`/dashboard/${newClass.id}?guide=true`);
    } catch (error) {
      console.error("Failed to create class and save roadmap:", error);
      toast({
        title: "Error",
        description: "Could not start your study journey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-headline">Your Personalized Study Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-background/60 rounded-lg border">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{analysis.totalLessons}</p>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background/60 rounded-lg border">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{analysis.estimatedWeeks}</p>
                <p className="text-sm text-muted-foreground">Estimated Weeks</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background/60 rounded-lg border">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{roadmap.units.length}</p>
                <p className="text-sm text-muted-foreground">Study Units</p>
              </div>
            </div>
          </div>

          {!isCustomFlow && (
            <>
              <Separator />

              {/* Strengths Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-700">Your Strengths</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      {strength}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  These areas show your existing knowledge. We'll include lighter review sessions for these topics.
                </p>
              </div>

              <Separator />

              {/* Areas for Improvement */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-amber-700">Priority Focus Areas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.priorityUnits.map((unit, index) => (
                    <Badge key={index} variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200">
                      {unit}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  These units need extra attention. Your roadmap includes additional practice and detailed explanations for these topics.
                </p>
              </div>

              <Separator />

              {/* Recommended Starting Point */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Recommended Starting Point</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">{analysis.recommendedStartingPoint}</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    Based on your diagnostic results, this is the optimal starting point for your study journey.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Study Plan Summary */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Your Personalized Approach</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  {isCustomFlow ? "Custom Focus" : "Strength Areas"}
                </h4>
                <p className="text-sm text-green-700">
                  {isCustomFlow 
                    ? "Tailored content based on your specific learning goals and interests"
                    : "Quick review sessions and practice problems to maintain your knowledge"
                  }
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">
                  {isCustomFlow ? "Comprehensive Coverage" : "Focus Areas"}
                </h4>
                <p className="text-sm text-amber-700">
                  {isCustomFlow
                    ? "Complete curriculum coverage to ensure you don't miss important concepts"
                    : "In-depth lessons, extra practice, and step-by-step explanations"
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-blue-500/10">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-3">
            <h3 className="text-2xl font-bold">Ready to Start Learning?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isAuthenticated 
                ? "Your personalized study plan is ready! Click below to access your interactive lessons, practice quizzes, and track your progress."
                : "Sign up now to access your personalized course with interactive lessons, practice quizzes, and progress tracking. It's completely free!"
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleSignUpAndStart}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium px-8 py-3 text-lg"
            >
              {loading ? (
                <LoadingSpinner className="mr-2 h-5 w-5" />
              ) : isAuthenticated ? (
                <GraduationCap className="mr-2 h-5 w-5" />
              ) : (
                <UserPlus className="mr-2 h-5 w-5" />
              )}
              {isAuthenticated ? "Start Your Study Journey" : "Sign Up & Start Learning"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {!isAuthenticated && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Free Forever • No Credit Card Required</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}