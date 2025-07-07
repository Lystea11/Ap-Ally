// src/app/(authenticated)/dashboard/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, BookOpen, Calendar as CalendarIcon, Pencil } from "lucide-react";
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

interface APClass {
  id: string;
  course_name: string;
  test_date: string | null;
}

export default function DashboardPage() {
  const [classes, setClasses] = useState<APClass[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const fetchClasses = async () => {
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return;
    };

    try {
      const res = await fetch('/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (error) {
      console.error("Failed to fetch classes", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, [getToken]);

  const deleteClass = async (classId: string) => {
    const token = await getToken();
    if (!token) return;

    await fetch(`/api/classes/${classId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setClasses(classes.filter(c => c.id !== classId));
  }

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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="font-headline text-3xl md:text-4xl text-foreground">Your AP Classes</h1>
              </div>
          </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {classes.map((apClass) => (
            <Card key={apClass.id} className="flex flex-col transition-transform hover:shadow-xl hover:-translate-y-1 bg-card">
              <CardHeader>
                <CardTitle className="font-headline text-xl">{apClass.course_name}</CardTitle>
                {apClass.test_date &&
                    <Badge variant="secondary" className="w-fit mt-2">
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        {new Date(apClass.test_date).toLocaleDateString()}
                    </Badge>
                }
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm">View your study roadmap and track your progress towards mastering the material.</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-muted/20 p-4 mt-auto">
                <Button asChild size="sm">
                  <Link href={`/dashboard/${apClass.id}`}>
                    <BookOpen className="mr-2 h-4 w-4" /> View Roadmap
                  </Link>
                </Button>
                <div className="flex items-center">
                    <EditClassDialog classId={apClass.id} currentTestDate={apClass.test_date} onClassUpdated={fetchClasses} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete your class and all its associated data, including your roadmap and progress.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteClass(apClass.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
          {/* Add New Class Card */}
          <Link href="/onboarding" className="block">
            <Card className="flex flex-col items-center justify-center text-center h-full border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-all duration-300 ease-in-out group">
              <div className="flex flex-col items-center justify-center p-6">
                <PlusCircle className="h-12 w-12 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                <p className="mt-4 font-semibold text-foreground group-hover:text-primary transition-colors">Add New Class</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}