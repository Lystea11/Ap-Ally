"use client";

import Link from "next/link";
import { Roadmap } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapViewerProps {
  roadmap: Roadmap;
}

export function RoadmapViewer({ roadmap }: RoadmapViewerProps) {
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
                    <span>{unit.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 pl-4">
                  {unit.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <Link
                        href={`/lesson/${lesson.id}`}
                        className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent/50"
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
