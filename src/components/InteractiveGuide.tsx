"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Lightbulb, Target, BookOpen, Trophy, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuideStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  icon: React.ComponentType<{ className?: string }>;
  position: "top" | "bottom" | "left" | "right" | "center";
}

interface InteractiveGuideProps {
  steps: GuideStep[];
  onComplete: () => void;
  onSkip: () => void;
  isVisible: boolean;
}

const defaultSteps: GuideStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Study Dashboard!",
    description: "Let's take a quick tour to help you get the most out of your personalized study plan.",
    icon: Lightbulb,
    position: "center"
  },
  {
    id: "progress-tracker",
    title: "Track Your Progress",
    description: "Monitor your overall progress and see how many lessons you've completed. This sidebar updates as you advance through your studies.",
    target: "[data-guide='progress-tracker']",
    icon: Target,
    position: "right"
  },
  {
    id: "strengths-weaknesses",
    title: "Analyze Your Performance",
    description: "See your strengths and areas that need focus. This analysis updates automatically as you complete lessons and helps you prioritize your study time.",
    target: "[data-guide='strengths-weaknesses']",
    icon: Target,
    position: "right"
  },
  {
    id: "practice-quiz",
    title: "Generate Practice Quizzes",
    description: "Create AP-style practice quizzes from any units you want to review. Choose from multiple choice, essays, or mixed formats that follow official AP rubrics.",
    target: "[data-guide='practice-quiz']",
    icon: Target,
    position: "right"
  },
  {
    id: "roadmap-units",
    title: "Your Study Units",
    description: "Each unit contains lessons tailored to your diagnostic results. Units where you need more practice have additional lessons and explanations.",
    target: "[data-guide='roadmap-units']",
    icon: BookOpen,
    position: "left"
  },
  {
    id: "lesson-navigation",
    title: "Start a Lesson",
    description: "Click on any lesson to begin studying. Green checkmarks show completed lessons, and the system tracks your mastery level.",
    target: "[data-guide='lesson-item']",
    icon: Play,
    position: "left"
  },
  {
    id: "completion",
    title: "You're All Set!",
    description: "Start with your recommended unit and work through the lessons at your own pace. Your personalized plan will adapt as you progress.",
    icon: Trophy,
    position: "center"
  }
];

export function InteractiveGuide({ 
  steps = defaultSteps, 
  onComplete, 
  onSkip, 
  isVisible 
}: InteractiveGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible && steps[currentStep]?.target) {
      const element = document.querySelector(steps[currentStep].target!);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add highlight effect
        element.classList.add("guide-highlight");
        return () => element.classList.remove("guide-highlight");
      }
    }
  }, [currentStep, isVisible, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isVisible || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Calculate position for targeted elements
  const getTooltipPosition = () => {
    if (!step.target) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const element = document.querySelector(step.target);
    if (!element) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (step.position) {
      case "top":
        return {
          top: rect.top - tooltipHeight - 20,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
        };
      case "bottom":
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
        };
      case "left":
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.left - tooltipWidth - 20,
        };
      case "right":
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.right + 20,
        };
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  const tooltipStyle = step.position === "center" 
    ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
    : getTooltipPosition();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300" />
      
      {/* Spotlight effect for targeted elements */}
      {step.target && (
        <div className="fixed inset-0 pointer-events-none z-[51]">
          <div 
            className="absolute bg-white/10 rounded-lg border-2 border-primary/50 shadow-lg"
            style={{
              ...(() => {
                const element = document.querySelector(step.target!);
                if (!element) return {};
                const rect = element.getBoundingClientRect();
                return {
                  top: rect.top - 4,
                  left: rect.left - 4,
                  width: rect.width + 8,
                  height: rect.height + 8,
                };
              })(),
            }}
          />
        </div>
      )}

      {/* Guide Tooltip */}
      <Card 
        className={cn(
          "fixed z-[52] w-80 shadow-2xl border-2 border-primary/20 transition-all duration-300",
          isAnimating && "opacity-0 scale-95"
        )}
        style={tooltipStyle}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <div className="flex gap-1">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          index <= currentStep ? "bg-primary" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip Tour
              </Button>
              <Button
                onClick={handleNext}
                size="sm"
                className="flex items-center gap-2"
              >
                {isLastStep ? "Get Started" : "Next"}
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom styles for highlighting */}
      <style jsx global>{`
        .guide-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          transition: box-shadow 0.3s ease;
        }
      `}</style>
    </>
  );
}