import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2,
  BookOpen,
  Clock,
  BarChart3,
  GraduationCap,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { StructuredData } from '@/components/StructuredData';
import { createSEOMetadata, getSubjectSEOData, generateStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo';
import { getSubjectBySlug, getAllSubjectSlugs } from '@/lib/subjectData';

interface Props {
  params: Promise<{ subject: string }>;
}

export async function generateStaticParams() {
  return getAllSubjectSlugs().map((slug) => ({ subject: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject } = await params;
  const subjectData = getSubjectBySlug(subject);
  if (!subjectData) return {};
  const seoData = getSubjectSEOData(subjectData.name);
  return createSEOMetadata({
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    canonicalUrl: seoData.canonicalUrl,
  });
}

const difficultyBadge: Record<string, string> = {
  Moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Hard: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Very Hard': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default async function SubjectPage({ params }: Props) {
  const { subject } = await params;
  const subjectData = getSubjectBySlug(subject);
  if (!subjectData) notFound();

  const courseStructuredData = generateStructuredData('course', {
    name: `${subjectData.name} Test Preparation`,
    description: subjectData.description,
    subjects: [subjectData.name],
  });

  const breadcrumbData = generateBreadcrumbStructuredData([
    { label: 'Home', href: '/' },
    { label: 'AP Subjects', href: '/' },
    { label: subjectData.name, href: `/subjects/${subjectData.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={courseStructuredData} />
      <StructuredData data={breadcrumbData} />

      {/* Minimal public header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-headline font-bold text-primary text-lg"
          >
            <GraduationCap className="h-5 w-5" />
            AP Ally
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/help" className="text-foreground/70 hover:text-primary transition-colors hidden sm:block">
              Help
            </Link>
            <Link
              href="/onboarding"
              className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-sm text-foreground/50 mb-8"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{subjectData.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Free AP Prep
            </Badge>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyBadge[subjectData.difficulty]}`}
            >
              {subjectData.difficulty}
            </span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">
            {subjectData.name} Study Guide & Prep
          </h1>
          <p className="text-lg text-foreground/70 leading-relaxed max-w-2xl">
            {subjectData.description}
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <Card className="bg-card/60 border border-white/20">
            <CardContent className="p-4 flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="text-xs text-foreground/60">Units</div>
                <div className="font-semibold">{subjectData.units}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 border border-white/20">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="text-xs text-foreground/60">Exam Duration</div>
                <div className="font-semibold text-sm leading-tight">{subjectData.examDuration}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 border border-white/20 col-span-2 md:col-span-1">
            <CardContent className="p-4 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="text-xs text-foreground/60">Exam Format</div>
                <div className="font-semibold text-sm leading-tight">{subjectData.examFormat}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key topics */}
        <Card className="mb-10 bg-card/60 border border-white/20">
          <CardHeader>
            <CardTitle className="text-xl">Key Topics Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subjectData.keyTopics.map((topic) => (
                <li key={topic} className="flex items-start gap-2 text-foreground/80">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{topic}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Exam overview */}
        <Card className="mb-10 bg-card/60 border border-white/20">
          <CardHeader>
            <CardTitle className="text-xl">About the {subjectData.name} Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-foreground/70">{subjectData.examDescription}</p>
            <p className="text-sm text-foreground/55">
              All AP exams are administered by the College Board every May. Scores range from 1
              to 5. Many colleges grant credit or advanced placement for scores of 3, 4, or 5.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <CardContent className="p-8 text-center">
            <h2 className="font-headline text-2xl font-bold mb-3">
              Start Your Free {subjectData.shortName} Prep Today
            </h2>
            <p className="text-foreground/70 mb-6 max-w-lg mx-auto">
              Get a personalized {subjectData.name} study plan powered by AI. Take a diagnostic
              quiz, identify your weak spots, and study smarter — completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/onboarding">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Get My Free Study Plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Learn More About AP Ally
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
