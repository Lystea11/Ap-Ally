// src/app/(authenticated)/onboarding/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { generateQuiz, GenerateQuizOutput } from "@/ai/flows/generate-quiz";
import { generateRoadmap } from "@/ai/flows/generate-roadmap";
import { useStudy } from "@/hooks/useStudy";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { QuizEngine } from "@/components/QuizEngine";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createClassAPI } from "@/lib/api-client";

const apCourseSections = [
  {
    label: "AP Capstone",
    courses: [
      "AP Seminar",
      "AP Research"
    ]
  },
  {
    label: "Arts",
    courses: [
      "AP 2‑D Art and Design",
      "AP 3‑D Art and Design",
      "AP Drawing",
      "AP Art History",
      "AP Music Theory"
    ]
  },
  {
    label: "English",
    courses: [
      "AP English Language and Composition",
      "AP English Literature and Composition"
    ]
  },
  {
    label: "History & Social Sciences",
    courses: [
      "AP African American Studies",
      "AP Comparative Government and Politics",
      "AP European History",
      "AP Human Geography",
      "AP Macroeconomics",
      "AP Microeconomics",
      "AP Psychology",
      "AP United States Government and Politics",
      "AP United States History",
      "AP World History: Modern"
    ]
  },
  {
    label: "Math & Computer Science",
    courses: [
      "AP Calculus AB",
      "AP Calculus BC",
      "AP Precalculus",
      "AP Statistics",
      "AP Computer Science A",
      "AP Computer Science Principles"
    ]
  },
  {
    label: "Sciences",
    courses: [
      "AP Biology",
      "AP Chemistry",
      "AP Environmental Science",
      "AP Physics 1: Algebra-Based",
      "AP Physics 2: Algebra-Based",
      "AP Physics C: Mechanics",
      "AP Physics C: Electricity and Magnetism"
    ]
  },
  {
    label: "World Languages & Cultures",
    courses: [
      "AP Chinese Language and Culture",
      "AP French Language and Culture",
      "AP German Language and Culture",
      "AP Italian Language and Culture",
      "AP Japanese Language and Culture",
      "AP Latin",
      "AP Spanish Language and Culture",
      "AP Spanish Literature and Culture"
    ]
  },
];

const experienceLevels = ["Beginner", "Intermediate", "Advanced"];

const formSchema = z.object({
  apCourse: z.string().min(1, "Please select a course."),
  experienceLevel: z.string().min(1, "Please select your experience level."),
  testDate: z.date().optional(),
});

type OnboardingFormValues = z.infer<typeof formSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { setRoadmap } = useStudy();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingFormValues | null>(null);
  
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apCourse: "",
      experienceLevel: "",
    },
  });

  const handleStep1Submit = async (data: OnboardingFormValues) => {
    setLoading(true);
    setLoadingMessage("Generating a quick quiz to assess your knowledge...");
    setOnboardingData(data);
    
    try {
      const result = await generateQuiz(data);
      if (!result?.questions?.length) {
        throw new Error("AI failed to generate quiz questions.");
      }
      
      setQuizData(result);
      setStep(2);
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast({
        title: "Error",
        description: "Could not generate your quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (answers: string) => {
    if (!onboardingData) return;
    
    setLoading(true);
    setLoadingMessage("Generating your personalized study roadmap...");
    setStep(3);
    
    try {
      const newClass = await createClassAPI(onboardingData.apCourse, onboardingData.testDate?.toISOString());

      const result = await generateRoadmap({ ...onboardingData, quizResults: answers });
      await setRoadmap(result.roadmap, newClass.id);
      router.push(`/dashboard/${newClass.id}`);
    } catch (error) {
      console.error("Failed to generate or save roadmap:", error);
      toast({
        title: "Error",
        description: "Could not create your roadmap. Please try again.",
        variant: "destructive",
      });
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const progressValue = (step / 3) * 100;

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card className="shadow-2xl">
        <CardHeader>
          <Progress value={progressValue} className="mb-4 h-2" />
          <CardTitle className="font-headline text-3xl">Let's get you set up</CardTitle>
          <CardDescription>
            {step === 1 && "Tell us about your learning goals to create your personalized plan."}
            {step === 2 && "Answer a few questions to gauge your current knowledge."}
            {step === 3 && "Please wait while we tailor your study plan."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleStep1Submit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="apCourse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Which AP course are you taking?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {apCourseSections.map((section) => (
                          <div key={section.label}>
                            <div
                              className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider select-none pointer-events-none bg-secondary/70 rounded-t-2xl"
                              style={{
                                letterSpacing: "0.08em",
                                marginTop: section.label === "AP Capstone" ? 0 : "0.75rem"
                              }}
                            >
                              {section.label}
                            </div>
                            {section.courses.map((course) => (
                              <SelectItem key={course} value={course}>
                                {course}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="testDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-lg">AP Test Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date > new Date("2100-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-lg">What is your experience level?</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                          {experienceLevels.map((level) => (
                            <FormItem key={level} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={level} />
                              </FormControl>
                              <FormLabel className="font-normal">{level}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} size="lg">
                  {loading ? <LoadingSpinner /> : "Next: Take Quiz"}
                </Button>
              </form>
            </FormProvider>
          )}

          {step === 2 && quizData && (
            <QuizEngine quiz={quizData} onSubmit={handleQuizSubmit} />
          )}

          {(loading && (step === 1 || step === 3)) && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <LoadingSpinner className="h-16 w-16" />
              <p className="text-lg text-muted-foreground">{loadingMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}