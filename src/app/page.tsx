// src/app/page.tsx

import { GraduationCap } from "lucide-react";
import { LandingPageClient } from "@/components/LandingPageClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { DynamicBackground } from "@/components/DynamicBackground";

const features = [
  "Personalized study roadmaps",
  "GPT-generated lessons and quizzes",
  "Interactive progress tracking",
  "Tailored to your experience level",
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <DynamicBackground />
      <div className="container relative z-10 flex flex-col items-center justify-center gap-8 px-4 py-16 text-center">
        <div className="flex items-center gap-4 rounded-full bg-primary/10 px-6 py-2 border border-primary/20 shadow-lg">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary sm:text-6xl md:text-7xl">
            AP Ally
            </h1>
        </div>
        <p className="max-w-3xl text-lg text-foreground/80 md:text-xl">
          Your personal AI-powered tutor for AP exams. Get a customized study plan, interactive lessons, and track your progress to ace your tests.
        </p>
        <LandingPageClient />

        <Card className="mt-12 w-full max-w-3xl text-left shadow-lg bg-card/60 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Core Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}