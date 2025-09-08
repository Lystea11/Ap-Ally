// src/app/page.tsx

import { GraduationCap, Brain, Target, TrendingUp, BookOpen, Users, Star, ArrowRight, CheckCircle2, Zap, Award, Clock } from "lucide-react";
import { LandingPageClient } from "@/components/LandingPageClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicBackground } from "@/components/DynamicBackground";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { generateStructuredData } from "@/lib/seo";
import { Metadata } from "next";
import { createSEOMetadata } from "@/lib/seo";

export const metadata: Metadata = createSEOMetadata({
  title: "AP Ally - Free AI-Powered AP Test Prep & Study Guide",
  description: "Master AP exams with AI-powered study plans, interactive lessons, and progress tracking. Free AP test prep for all subjects.",
  keywords: [
    "AP test prep",
    "AP exam preparation", 
    "free AP study guide",
    "AI tutoring",
    "AP practice tests",
    "personalized study plan",
    "AP Biology prep",
    "AP Chemistry prep",
    "AP Calculus prep",
    "AP Physics prep",
    "AP English prep",
    "AP History prep",
    "college board prep",
    "high school test prep",
    "exam preparation tool"
  ],
  canonicalUrl: "https://ap-ally.com",
});

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
  const websiteStructuredData = generateStructuredData('website');
  const organizationStructuredData = generateStructuredData('organization');
  const courseStructuredData = generateStructuredData('course', {
    name: 'AP Test Preparation Course',
    description: 'Comprehensive AP exam preparation with AI-powered personalized tutoring across all major AP subjects.',
    subjects: ['AP Biology', 'AP Chemistry', 'AP Physics', 'AP Calculus', 'AP English', 'AP History'],
    duration: 'P3M'
  });

  const faqStructuredData = generateStructuredData('faq', {
    questions: [
      {
        question: 'Is AP Ally really free?',
        answer: 'Yes! AP Ally is completely free to use. We\'re supported by advertising revenue, which allows us to provide high-quality AP prep content at no cost to students.'
      },
      {
        question: 'How does AP Ally\'s AI personalization work?',
        answer: 'Our AI analyzes your quiz responses, study patterns, and learning preferences to create customized study plans. The more you use AP Ally, the better our recommendations become.'
      },
      {
        question: 'Which AP subjects does AP Ally support?',
        answer: 'We support major AP subjects including Mathematics, Sciences, English, History, and Social Studies. We\'re continuously adding new subjects based on user demand.'
      },
      {
        question: 'How accurate are the practice tests?',
        answer: 'Our practice tests are designed to closely mirror actual AP exam formats and difficulty levels. They\'re created using official AP guidelines and reviewed by subject matter experts.'
      }
    ]
  });

  return (
    <main className="relative overflow-hidden">
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={courseStructuredData} />
      <StructuredData data={faqStructuredData} />
      <DynamicBackground />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="container max-w-7xl">
          <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20 text-sm">
            🚀 AI-Powered AP Exam Preparation
          </Badge>
          
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-2xl">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h1 className="font-headline text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-primary">
              AP Ally
            </h1>
          </div>
          
          <p className="max-w-4xl mx-auto text-lg sm:text-xl md:text-2xl text-foreground/80 mb-8 leading-relaxed px-2">
            Transform your AP exam preparation with personalized AI tutoring. Get customized study plans, 
            interactive lessons, and real-time progress tracking to achieve your target score.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12 px-2">
            <Badge variant="outline" className="bg-background/80 backdrop-blur text-xs sm:text-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Save 40+ hours of study time
            </Badge>
            <Badge variant="outline" className="bg-background/80 backdrop-blur text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Increase scores by 1.2 points on average
            </Badge>
            <Badge variant="outline" className="bg-background/80 backdrop-blur text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Trusted by 10,000+ students
            </Badge>
          </div>
          
          <div className="flex justify-center mb-12">
            <LandingPageClient />
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-16 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-card/60 backdrop-blur-xl border border-white/20 text-center">
                <CardContent className="p-3 sm:p-6">
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary mx-auto mb-2" />
                  <div className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-foreground/60">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto px-2">
              Our comprehensive platform combines AI technology with proven study methods to maximize your AP exam performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card/60 backdrop-blur-xl border border-white/20 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm sm:text-base text-foreground/70 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4 bg-primary/5">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-4">
              How AP Ally Works
            </h2>
            <p className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto px-2">
              Our proven 4-step process helps you go from struggling student to AP exam success story.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <Card className="bg-card/60 backdrop-blur-xl border border-white/20 text-center h-full">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary text-primary-foreground rounded-full text-xl sm:text-2xl font-bold mb-4 sm:mb-6 mx-auto">
                      {step.step}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{step.title}</h3>
                    <p className="text-sm sm:text-base text-foreground/70 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                
                {index < steps.length - 1 && (
                  <>
                    {/* Desktop arrow */}
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-8 w-8 text-primary/40" />
                    </div>
                    {/* Mobile arrow */}
                    <div className="block lg:hidden flex justify-center my-4">
                      <ArrowRight className="h-6 w-6 text-primary/40 rotate-90" />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20">
            <CardContent className="p-8 sm:p-12">
              <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-4">
                Ready to Ace Your AP Exams?
              </h2>
              <p className="text-lg sm:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto px-2">
                Join thousands of students who have improved their AP scores with personalized AI tutoring. 
                Start your journey to academic success today.
              </p>
              
              <div className="flex flex-col gap-4 justify-center items-center">
                <div className="flex justify-center">
                  <LandingPageClient />
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground/60">
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