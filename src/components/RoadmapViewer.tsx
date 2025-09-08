
"use client";

import Link from "next/link";
import { Roadmap } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, BookOpen, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdTrigger } from "@/context/AdContext";
import { useEffect } from "react";

interface RoadmapViewerProps {
  roadmap: Roadmap;
}

export function RoadmapViewer({ roadmap }: RoadmapViewerProps) {
  const { triggerUnitCompletionAd, triggerRoadmapCheckpointAd } = useAdTrigger();

  useEffect(() => {
    // Check for newly completed units and trigger ads
    const completedUnits = roadmap.units.filter(unit => 
      unit.lessons.length > 0 && unit.lessons.every(lesson => lesson.completed)
    );
    
    // Check overall progress milestones
    const totalLessons = roadmap.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
    const completedLessons = roadmap.units.reduce((sum, unit) => 
      sum + unit.lessons.filter(lesson => lesson.completed).length, 0
    );
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    
    // Trigger milestone checkpoints
    if (progressPercentage >= 25 && progressPercentage < 50) {
      triggerRoadmapCheckpointAd({
        milestone: "25% Complete",
        completedLessons,
        totalLessons,
        progressPercentage,
      });
    } else if (progressPercentage >= 50 && progressPercentage < 75) {
      triggerRoadmapCheckpointAd({
        milestone: "50% Complete",
        completedLessons,
        totalLessons,
        progressPercentage,
      });
    } else if (progressPercentage >= 75 && progressPercentage < 100) {
      triggerRoadmapCheckpointAd({
        milestone: "75% Complete",
        completedLessons,
        totalLessons,
        progressPercentage,
      });
    }
  }, [roadmap, triggerUnitCompletionAd, triggerRoadmapCheckpointAd]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-3xl">{roadmap.title}</CardTitle>
        </div>
        <CardDescription>
            Here is your personalized study plan. Work through the units and lessons to prepare for your exam.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {roadmap.units.map((unit, index) => (
            <AccordionItem value={`item-${index}`} key={unit.id}>
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-4">
                    <span className="text-primary font-bold">Unit {index + 1}</span>
                    <span>{unit.title.replace(/^Unit\s+\d+:?\s*/i, '').trim()}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-4">
                  {unit.lessons.map((lesson, lessonIndex) => (
                    <li key={lesson.id}>
                      <Link
                        href={`/lesson/${lesson.id}`}
                        className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent/50"
                        data-guide={lessonIndex === 0 && index === 0 ? "lesson-item" : undefined}
                      >
                        {lesson.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            "text-base",
                            lesson.completed && "text-muted-foreground line-through"
                          )}
                        >
                          {lesson.title}
                        </span>
                        {lesson.mastery && (
                            <Award className="ml-auto h-5 w-5 text-yellow-500 transition-transform group-hover:scale-125" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
