// src/app/page.tsx

import { GraduationCap, TrendingUp, BookOpen, CheckCircle2, Clock, ArrowUpRight, Sparkles } from "lucide-react";
import { LandingPageClient } from "@/components/LandingPageClient";
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

// Bento-grid style content items
const bentoItems = [
  {
    size: "lg",
    icon: GraduationCap,
    title: "AI-Powered Learning",
    description: "Advanced algorithms analyze your strengths and weaknesses to create perfect study path",
    highlight: "Adaptive technology",
    gradient: "from-blue-500/10 to-indigo-500/10"
  },
  {
    size: "sm",
    icon: Clock,
    title: "Save 40+ Hours",
    description: "Study smarter with targeted lessons that skip what you already know",
    number: "40+",
    label: "Hours Saved",
    gradient: "from-emerald-500/10 to-teal-500/10"
  },
  {
    size: "sm",
    icon: TrendingUp,
    title: "Score Higher",
    description: "Students see an average 1.2 point increase on their AP scores",
    number: "+1.2",
    label: "Points Gained",
    gradient: "from-amber-500/10 to-orange-500/10"
  },
  {
    size: "md",
    icon: BookOpen,
    title: "Complete AP Coverage",
    description: "Every major AP subject with comprehensive curriculum, from Biology to Calculus AB/BC",
    subjects: ["Biology", "Chemistry", "Physics", "Calc", "English", "History"],
    gradient: "from-purple-500/10 to-pink-500/10"
  },
  {
    size: "md",
    icon: Sparkles,
    title: "Instant Feedback Loop",
    description: "Get detailed explanations immediately after every question. Learn from mistakes in real-time.",
    gradient: "from-rose-500/10 to-red-500/10"
  },
];

const subjects = [
  "AP Biology",
  "AP Chemistry",
  "AP Physics 1",
  "AP Physics C",
  "AP Calculus AB",
  "AP Calculus BC",
  "AP English Lang",
  "AP English Lit",
  "AP US History",
  "AP World History",
  "AP Psychology",
  "AP Statistics"
];

const howItWorks = [
  {
    title: "Assess",
    description: "Quick diagnostic identifies your current level",
    duration: "5 min"
  },
  {
    title: "Plan",
    description: "AI generates your personalized roadmap",
    duration: "Instant"
  },
  {
    title: "Learn",
    description: "Interactive lessons adapted to your pace",
    duration: "Ongoing"
  },
  {
    title: "Dominate",
    description: "Ace your AP exam with confidence",
    duration: "Exam Day"
  }
];

const stats = [
  { value: "10,000+", label: "Students" },
  { value: "94%", label: "Success Rate" },
  { value: "50,000+", label: "Questions" },
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
    <main className="min-h-screen bg-background">
      <StructuredData data={websiteStructuredData} />
      <StructuredData data={organizationStructuredData} />
      <StructuredData data={courseStructuredData} />
      <StructuredData data={faqStructuredData} />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative container max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary/80 mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Free forever. AI-powered.</span>
            </div>

            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8">
              Ace your AP
              <br />
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-primary bg-clip-text text-transparent">
                exams.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/60 leading-relaxed mb-12 max-w-2xl">
              Personalized AI tutoring that adapts to how you learn.
              Get your perfect study plan in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <LandingPageClient />

              <div className="flex items-center gap-6 text-sm text-foreground/50">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  No credit card
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subject Scroll */}
      <section className="py-8 border-y border-border/50 overflow-hidden">
        <div className="flex gap-8 animate-moving-lines whitespace-nowrap">
          {[...subjects, ...subjects, ...subjects].map((subject, i) => (
            <span
              key={`${subject}-${i}`}
              className="text-foreground/40 text-lg font-medium"
            >
              {subject}
            </span>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-headline text-4xl md:text-5xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-foreground/50 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="py-20 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight mb-4">
              One platform.
              <br />
              <span className="text-foreground/50">Everything you need.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[200px] gap-4">
            {/* Large item */}
            <div className="md:col-span-2 md:row-span-2 p-8 rounded-3xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-border/50 hover:border-primary/30 transition-colors group">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-headline text-2xl md:text-3xl font-semibold mb-3">
                    AI-Powered Learning
                  </h3>
                  <p className="text-foreground/60 text-lg max-w-md">
                    Advanced algorithms analyze your strengths and weaknesses to create perfect study path
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-primary font-medium mt-4 group-hover:translate-x-2 transition-transform">
                  <span>{bentoItems[0]?.highlight}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Small items */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-border/50 hover:border-emerald-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-headline text-xl font-semibold mb-2">
                Save 40+ Hours
              </h3>
              <p className="text-foreground/50 text-sm">
                Study smarter with targeted lessons
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-border/50 hover:border-amber-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-headline text-xl font-semibold mb-2">
                Score Higher
              </h3>
              <p className="text-foreground/50 text-sm">
                Average +1.2 point increase
              </p>
            </div>

            {/* Medium items */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-border/50 hover:border-purple-500/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-headline text-xl font-semibold mb-2">
                    Complete AP Coverage
                  </h3>
                  <p className="text-foreground/50">
                    Every major AP subject with comprehensive curriculum
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bentoItems[3]?.subjects.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-3 p-8 rounded-3xl bg-gradient-to-br from-rose-500/5 to-red-500/5 border border-border/50 hover:border-rose-500/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5 text-rose-600" />
                  </div>
                  <h3 className="font-headline text-xl font-semibold mb-2">
                    Instant Feedback Loop
                  </h3>
                  <p className="text-foreground/50">
                    Get detailed explanations immediately after every question. Learn from mistakes in real-time.
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-headline text-4xl font-bold text-rose-600">
                    0s
                  </div>
                  <div className="text-foreground/40 text-sm">
                    Delay time
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Minimal */}
      <section className="py-20 px-4 bg-primary/[0.02]">
        <div className="container max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Four steps to
              <br />
              <span className="text-foreground/50">AP success.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="sticky top-8">
                  <div className="font-headline text-6xl md:text-7xl font-bold text-primary/10 absolute -top-8 -left-2">
                    0{i + 1}
                  </div>
                  <h3 className="font-headline text-xl font-semibold mb-2 relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-foreground/60 mb-4 relative z-10">
                    {step.description}
                  </p>
                  <span className="text-xs text-foreground/40 uppercase tracking-wider relative z-10">
                    {step.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="font-headline text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to dominate
            <br />
            <span className="bg-gradient-to-r from-primary via-indigo-600 to-primary bg-clip-text text-transparent">
              your AP exams?
            </span>
          </h2>
          <p className="text-xl text-foreground/60 mb-12 max-w-2xl mx-auto">
            Join thousands of students who are already acing their APs.
          </p>
          <LandingPageClient />
        </div>
      </section>

      <Footer />
    </main>
  );
}
