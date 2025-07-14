// src/app/page.tsx

import { GraduationCap, Brain, Target, TrendingUp, BookOpen, Users, Star, ArrowRight, CheckCircle2, Zap, Award, Clock } from "lucide-react";
import { LandingPageClient } from "@/components/LandingPageClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Learning",
    description: "Advanced AI creates personalized study plans based on your strengths, weaknesses, and learning style"
  },
  {
    icon: Target,
    title: "Targeted Practice",
    description: "Focus on your problem areas with customized quizzes and exercises designed to improve your weak spots"
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Real-time analytics show your improvement over time with detailed performance insights"
  },
  {
    icon: BookOpen,
    title: "Comprehensive Content",
    description: "Access complete AP curriculum coverage with interactive lessons, practice tests, and study materials"
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Get immediate explanations for wrong answers and detailed solutions to master concepts quickly"
  },
  {
    icon: Award,
    title: "Exam Simulation",
    description: "Practice with realistic AP exam conditions to build confidence and reduce test anxiety"
  }
];

const steps = [
  {
    step: "1",
    title: "Take Assessment",
    description: "Complete our diagnostic test to identify your current knowledge level and learning gaps"
  },
  {
    step: "2",
    title: "Get Your Plan",
    description: "Receive a personalized study roadmap tailored to your goals and timeline"
  },
  {
    step: "3",
    title: "Study Smart",
    description: "Follow interactive lessons, complete practice problems, and track your progress"
  },
  {
    step: "4",
    title: "Ace Your Exam",
    description: "Take practice exams and get final review materials to maximize your AP score"
  }
];

const stats = [
  { label: "Average Score Increase", value: "1.2 points", icon: TrendingUp },
  { label: "Students Helped", value: "10,000+", icon: Users },
  { label: "Practice Questions", value: "50,000+", icon: BookOpen },
  { label: "Success Rate", value: "94%", icon: Star }
];

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <DynamicBackground />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="container max-w-7xl">
          <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
            🚀 AI-Powered AP Exam Preparation
          </Badge>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-headline text-6xl font-bold tracking-tighter text-primary sm:text-7xl md:text-8xl">
              AP Ally
            </h1>
          </div>
          
          <p className="max-w-4xl mx-auto text-xl text-foreground/80 md:text-2xl mb-8 leading-relaxed">
            Transform your AP exam preparation with personalized AI tutoring. Get customized study plans, 
            interactive lessons, and real-time progress tracking to achieve your target score.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Badge variant="outline" className="bg-background/80 backdrop-blur">
              <Clock className="w-4 h-4 mr-2" />
              Save 40+ hours of study time
            </Badge>
            <Badge variant="outline" className="bg-background/80 backdrop-blur">
              <Target className="w-4 h-4 mr-2" />
              Increase scores by 1.2 points on average
            </Badge>
            <Badge variant="outline" className="bg-background/80 backdrop-blur">
              <Users className="w-4 h-4 mr-2" />
              Trusted by 10,000+ students
            </Badge>
          </div>
          
          <div className="flex justify-center">
            <LandingPageClient />
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card/60 backdrop-blur-xl border border-white/20 text-center">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-foreground/60">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Our comprehensive platform combines AI technology with proven study methods to maximize your AP exam performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/60 backdrop-blur-xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-24 px-4 bg-primary/5">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-bold mb-4">
              How AP Ally Works
            </h2>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Our proven 4-step process helps you go from struggling student to AP exam success story.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <Card className="bg-card/60 backdrop-blur-xl border border-white/20 text-center h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-2xl font-bold mb-6 mx-auto">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <p className="text-foreground/70 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-8 w-8 text-primary/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20">
            <CardContent className="p-12">
              <h2 className="font-headline text-4xl font-bold mb-4">
                Ready to Ace Your AP Exams?
              </h2>
              <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
                Join thousands of students who have improved their AP scores with personalized AI tutoring. 
                Start your journey to academic success today.
              </p>
              
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="flex justify-center">
                    <LandingPageClient />
                  </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Free Forever • Monetized Through Ads</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}