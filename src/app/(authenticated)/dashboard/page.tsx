// src/app/(authenticated)/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, BookOpen, Calendar as CalendarIcon, Pencil, Target } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EditClassDialog } from "@/components/EditClassDialog";
import { Goals } from "@/components/Goals";
import { Countdown } from "@/components/Countdown";
import { StreakWidget } from "@/components/StreakWidget";
import { GamificationStats } from "@/components/GamificationStats";
import { BoarAvatar } from "@/components/BoarAvatar";
import { useGamification } from "@/hooks/useGamification";
import { getClassesAPI, deleteClassAPI } from "@/lib/api-client";
import type { APClass } from "@/lib/types";

export default function DashboardPage() {
  const [classes, setClasses] = useState<APClass[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { gamificationData } = useGamification();

  const fetchClasses = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await getClassesAPI();
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const deleteClass = async (classId: string) => {
    try {
      await deleteClassAPI(classId);
      fetchClasses();
    } catch (error) {
      console.error("Failed to delete class", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-muted/40 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl text-foreground">
              Welcome, {user?.displayName || "Student"}!
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Here's your command center for AP success.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div>
            <h2 className="font-headline text-xl sm:text-2xl mb-4">Your AP Classes</h2>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {classes.map((apClass) => (
                <Card key={apClass.id} className="flex flex-col transition-transform hover:shadow-xl hover:-translate-y-1 bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="font-headline text-lg sm:text-xl">{apClass.course_name}</CardTitle>
                    {apClass.test_date && (
                      <Badge variant="secondary" className="w-fit mt-2 text-xs">
                        <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        {new Date(apClass.test_date).toLocaleDateString()}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow pb-3">
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      View your study roadmap and track your progress.
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 bg-muted/20 p-3 sm:p-4 mt-auto">
                    <Button asChild size="sm" className="w-full sm:w-auto">
                      <Link href={`/dashboard/${apClass.id}`}>
                        <BookOpen className="mr-2 h-4 w-4" /> View Roadmap
                      </Link>
                    </Button>
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <EditClassDialog
                        classId={apClass.id}
                        currentTestDate={apClass.test_date ?? null}
                        onClassUpdated={fetchClasses}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 sm:mx-0">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete your class and all its associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteClass(apClass.id)}
                              className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </Card>
              ))}
              {/* Boar Level Card */}
              <Card className="flex flex-col transition-transform hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                {/* Header with centered boar and title */}
                <CardHeader className="pb-4 pt-6">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <BoarAvatar 
                      boarLevel={gamificationData?.boar_level || 1}
                      size="lg"
                      showBadge={true}
                    />
                    <CardTitle className="font-headline text-lg sm:text-xl">
                      {gamificationData?.boar_level === 1 && "Apprentice Elephant"}
                      {gamificationData?.boar_level === 2 && "Scholar Elephant"}  
                      {gamificationData?.boar_level === 3 && "Master Elephant"}
                    </CardTitle>
                  </div>
                </CardHeader>

                {/* Progress section */}
                <CardContent className="flex-grow px-4 pb-4">
                  {gamificationData?.boar_level === 3 ? (
                    <div className="flex items-center justify-center py-3">
                      <div className="flex items-center gap-2 text-amber-600">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold tracking-wide">MAX LEVEL</span>
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="font-medium">Progress to Next Level</span>
                        <span className="font-semibold">{Math.max(
                          Math.min((gamificationData?.lessons_completed_count || 0) / (gamificationData?.boar_level === 1 ? 10 : 25) * 100, 100),
                          Math.min((gamificationData?.practice_quizzes_completed || 0) / (gamificationData?.boar_level === 1 ? 3 : 7) * 100, 100),
                          gamificationData?.boar_level === 2 ? Math.min((gamificationData?.current_streak || 0) / 7 * 100, 100) : 0
                        ).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-muted/60 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full transition-all duration-700 shadow-sm"
                          style={{
                            width: `${Math.max(
                              Math.min((gamificationData?.lessons_completed_count || 0) / (gamificationData?.boar_level === 1 ? 10 : 25) * 100, 100),
                              Math.min((gamificationData?.practice_quizzes_completed || 0) / (gamificationData?.boar_level === 1 ? 3 : 7) * 100, 100),
                              gamificationData?.boar_level === 2 ? Math.min((gamificationData?.current_streak || 0) / 7 * 100, 100) : 0
                            )}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Stats footer */}
                <CardFooter className="bg-muted/20 p-4 mt-auto">
                  <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="text-center">
                      <div className="text-xl font-bold text-blue-600 mb-1">
                        {gamificationData?.lessons_completed_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">Lessons</div>
                    </div>
                    <div className="text-center border-l border-r border-muted">
                      <div className="text-xl font-bold text-purple-600 mb-1">
                        {gamificationData?.practice_quizzes_completed || 0}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">Quizzes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-600 mb-1">
                        {gamificationData?.current_streak || 0}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">Streak</div>
                    </div>
                  </div>
                </CardFooter>
              </Card>

              <Link href="/add-class" className="block">
                <Card className="flex flex-col items-center justify-center text-center h-full min-h-[200px] border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-all duration-300 ease-in-out group">
                  <div className="flex flex-col items-center justify-center p-6">
                    <PlusCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    <p className="mt-3 sm:mt-4 font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                      Add New Class
                    </p>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
          <StreakWidget 
            currentStreak={gamificationData?.current_streak || 0}
            longestStreak={gamificationData?.longest_streak || 0}
            lastLessonDate={gamificationData?.last_lesson_date}
          />
          <Goals />
          <Countdown classes={classes} />
        </div>
      </div>
    </div>
  );
}