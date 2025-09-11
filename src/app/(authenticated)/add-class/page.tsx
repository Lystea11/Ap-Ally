// src/app/(authenticated)/add-class/page.tsx

"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { generateQuiz, GenerateQuizOutput } from "@/ai/flows/generate-quiz";
import { generateRoadmap } from "@/ai/flows/generate-roadmap";
import { generateCustomRoadmap } from "@/ai/flows/generate-custom-roadmap";
import { useStudy } from "@/hooks/useStudy";
import { useToast } from "@/hooks/use-toast";
import { AuthContext } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { QuizEngine } from "@/components/QuizEngine";
import { RoadmapRecap } from "@/components/RoadmapRecap";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createClassAPI } from "@/lib/api-client";
import Link from "next/link";

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

const formSchema = z.object({
  apCourse: z.string().min(1, "Please select a course."),
  testDate: z.date().optional(),
  customDescription: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof formSchema>;

export default function AddClassPage() {
  const router = useRouter();
  const { setRoadmap } = useStudy();
  const { toast } = useToast();
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    throw new Error("AddClassPage must be used within AuthProvider");
  }
  
  const { user } = authContext;
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingFormValues | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<string>("");
  const [generatedRoadmap, setGeneratedRoadmap] = useState<any>(null);
  const [newClassId, setNewClassId] = useState<string>("");
  const [isCustomFlow, setIsCustomFlow] = useState(false);
  
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apCourse: "",
      customDescription: "",
    },
  });

  const handleStep1Submit = async (data: OnboardingFormValues) => {
    setLoading(true);
    setLoadingMessage("Generating a comprehensive diagnostic quiz to assess your knowledge across different AP topics...");
    setOnboardingData(data);
    
    try {
      const result = await generateQuiz({ apCourse: data.apCourse });
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

  const handleCustomSubmit = async (data: OnboardingFormValues) => {
    if (!data.customDescription?.trim()) {
      toast({
        title: "Error",
        description: "Please describe what you want to study.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLoadingMessage("Generating your personalized study roadmap based on your description...");
    setOnboardingData(data);
    
    try {
      const newClass = await createClassAPI(data.apCourse, data.testDate?.toISOString());
      
      const result = await generateCustomRoadmap({ 
        apCourse: data.apCourse, 
        customDescription: data.customDescription 
      });
      
      setGeneratedRoadmap(result.roadmap);
      setNewClassId(newClass.id);
      setStep(3);
    } catch (error) {
      console.error("Failed to generate custom roadmap:", error);
      toast({
        title: "Error",
        description: "Could not create your custom roadmap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (answers: string, rawAnswers: Record<number, string>, quizData: GenerateQuizOutput) => {
    if (!onboardingData) return;
    
    setLoading(true);
    setLoadingMessage("Generating your personalized study roadmap...");
    setQuizAnswers(answers);
    
    try {
      const newClass = await createClassAPI(onboardingData.apCourse, onboardingData.testDate?.toISOString());
      
      // Save quiz results to database
      try {
        await fetch('/api/onboarding-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userUid: user?.uid || '',
            apClassId: newClass.id,
            quizData: quizData,
            answers: rawAnswers
          })
        });
      } catch (quizError) {
        console.error("Failed to save quiz results:", quizError);
        // Don't fail the whole process if quiz saving fails
      }
      
      const result = await generateRoadmap({ apCourse: onboardingData.apCourse, quizResults: answers });
      
      setGeneratedRoadmap(result.roadmap);
      setNewClassId(newClass.id);
      setStep(3);
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

  const handleStartJourney = async () => {
    if (!generatedRoadmap || !newClassId) return;
    
    try {
      await setRoadmap(generatedRoadmap, newClassId);
      router.push(`/dashboard/${newClassId}?guide=true`);
    } catch (error) {
      console.error("Failed to save roadmap:", error);
      toast({
        title: "Error",
        description: "Could not save your roadmap. Please try again.",
        variant: "destructive",
      });
    }
  };

  const progressValue = (step / 3) * 100;

return (
  <>
    {loading && (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <LoadingSpinner className="h-16 w-16" />
        <p className="mt-4 text-lg text-muted-foreground text-center max-w-md px-4">
          {loadingMessage}
        </p>
      </div>
    )}

    {!loading && (
      <div className="container mx-auto max-w-2xl py-6 sm:py-12 px-4">
        {/* Back to Dashboard Link */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <Progress value={progressValue} className="mb-4 h-2" />
            <CardTitle className="font-headline text-2xl sm:text-3xl">
              Add a New AP Class
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {step === 1 && !isCustomFlow &&
                "Select your AP course and test date to begin your personalized study journey."}
              {step === 1 && isCustomFlow &&
                "Describe what you want to study and we'll create a custom roadmap just for you."}
              {step === 2 &&
                "Take a comprehensive diagnostic quiz to assess your knowledge across different units and skills."}
              {step === 3 && !isCustomFlow &&
                "Here's your personalized study plan based on your diagnostic results."}
              {step === 3 && isCustomFlow &&
                "Here's your personalized study plan based on your custom description."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <FormProvider {...form}>
                {!isCustomFlow ? (
                  <form
                    onSubmit={form.handleSubmit(handleStep1Submit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="apCourse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">
                            Which AP course are you taking?
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
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
                                      marginTop:
                                        section.label === "AP Capstone"
                                          ? 0
                                          : "0.75rem",
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
                          <FormLabel className="text-lg">
                            AP Test Date (Optional)
                          </FormLabel>
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
                                  date < new Date() ||
                                  date > new Date("2100-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col gap-4">
                      <Button type="submit" disabled={loading} size="lg" className="w-full">
                        {loading ? <LoadingSpinner /> : "Next: Take Diagnostic Quiz"}
                      </Button>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1 border-t"></div>
                        <span className="text-sm text-muted-foreground">OR</span>
                        <div className="flex-1 border-t"></div>
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="lg"
                        onClick={() => setIsCustomFlow(true)}
                        disabled={loading}
                      >
                        I already know what I want to study
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form
                    onSubmit={form.handleSubmit(handleCustomSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="apCourse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">
                            Which AP course are you taking?
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
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
                                      marginTop:
                                        section.label === "AP Capstone"
                                          ? 0
                                          : "0.75rem",
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
                          <FormLabel className="text-lg">
                            AP Test Date (Optional)
                          </FormLabel>
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
                                  date < new Date() ||
                                  date > new Date("2100-01-01")
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
                      name="customDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">
                            What specifically do you want to study?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what you want to focus on in your AP course. For example: 'I want to focus on calculus applications in physics problems' or 'I need help with essay writing techniques for the DBQ section'..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col gap-4">
                      <Button type="submit" disabled={loading} size="lg" className="w-full">
                        {loading ? <LoadingSpinner /> : "Generate Custom Study Plan"}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsCustomFlow(false)}
                        disabled={loading}
                      >
                        ← Back to diagnostic quiz
                      </Button>
                    </div>
                  </form>
                )}
              </FormProvider>
            )}

            {step === 2 && quizData && !isCustomFlow && (
              <QuizEngine quiz={quizData} onSubmit={handleQuizSubmit} />
            )}

            {step === 3 && !loading && generatedRoadmap && (
              <RoadmapRecap
                roadmap={generatedRoadmap}
                quizResults={isCustomFlow ? "" : quizAnswers}
                onStartJourney={handleStartJourney}
                isAuthenticated={true}
              />
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <LoadingSpinner className="h-16 w-16" />
                <p className="text-lg text-muted-foreground">{loadingMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )}
  </>
);
}