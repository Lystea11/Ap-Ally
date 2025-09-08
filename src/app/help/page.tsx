import { ArrowLeft, HelpCircle, Mail, MessageSquare, FileText, AlertCircle, Lightbulb, Book, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";

import { createSEOMetadata } from "@/lib/seo";

export const metadata = createSEOMetadata({
  title: "Help Center - AP Ally",
  description: "Get help and support for AP Ally. Find answers to common questions about our free AI-powered AP test prep platform and contact our support team.",
  keywords: [
    "AP Ally help",
    "AP test prep support",
    "AP study guide help",
    "contact support",
    "AP prep FAQ",
    "AP exam help",
    "study help",
    "test preparation support"
  ],
  canonicalUrl: "https://ap-ally.com/help",
});

export default function HelpCenterPage() {
  const faqs = [
    {
      question: "How does AP Ally's AI personalization work?",
      answer: "Our AI analyzes your quiz responses, study patterns, and learning preferences to create customized study plans. The more you use AP Ally, the better our recommendations become.",
      category: "Features"
    },
    {
      question: "Is AP Ally really free?",
      answer: "Yes! AP Ally is completely free to use. We're supported by advertising revenue, which allows us to provide high-quality AP prep content at no cost to students.",
      category: "Pricing"
    },
    {
      question: "Which AP subjects does AP Ally support?",
      answer: "We currently support major AP subjects including Mathematics, Sciences, English, History, and Social Studies. We're continuously adding new subjects based on user demand.",
      category: "Content"
    },
    {
      question: "How accurate are the practice tests?",
      answer: "Our practice tests are designed to closely mirror actual AP exam formats and difficulty levels. They're created using official AP guidelines and reviewed by subject matter experts.",
      category: "Content"
    },
    {
      question: "Can I use AP Ally on mobile devices?",
      answer: "Absolutely! AP Ally is fully responsive and works seamlessly on phones, tablets, and desktop computers. Study anywhere, anytime.",
      category: "Technical"
    },
    {
      question: "How do I track my progress?",
      answer: "Your dashboard provides detailed analytics including performance trends, strengths and weaknesses, time spent studying, and progress toward your goals.",
      category: "Features"
    }
  ];

  const contactOptions = [
    {
      title: "General Support",
      description: "Questions about using AP Ally, account issues, or general inquiries",
      email: "support@ap-ally.com",
      icon: HelpCircle,
      responseTime: "24 hours"
    },
    {
      title: "Technical Issues",
      description: "Bug reports, website problems, or technical difficulties",
      email: "tech@ap-ally.com",
      icon: AlertCircle,
      responseTime: "12 hours"
    },
    {
      title: "Content Feedback",
      description: "Suggestions for new content, subject requests, or content corrections",
      email: "content@ap-ally.com",
      icon: Book,
      responseTime: "48 hours"
    },
    {
      title: "Partnerships",
      description: "School partnerships, educator resources, or business inquiries",
      email: "partnerships@ap-ally.com",
      icon: Users,
      responseTime: "3-5 days"
    },
    {
      title: "Privacy & Legal",
      description: "Privacy concerns, legal questions, or data requests",
      email: "legal@ap-ally.com",
      icon: FileText,
      responseTime: "5-7 days"
    },
    {
      title: "Feedback & Ideas",
      description: "Feature requests, improvement suggestions, or general feedback",
      email: "feedback@ap-ally.com",
      icon: Lightbulb,
      responseTime: "48 hours"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumbs 
            items={[
              { label: "Help Center", href: "/help" }
            ]}
            className="mb-4"
          />
          <Link href="/">
            <Button variant="ghost" className="mb-4 -ml-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-headline text-4xl font-bold">Help Center</h1>
            </div>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Get the support you need to succeed with AP Ally. Find answers to common questions 
              or contact our team directly.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card/60 backdrop-blur-xl border border-white/20 text-center">
            <CardContent className="p-6">
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">24hrs</div>
              <div className="text-sm text-foreground/60">Average Response Time</div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-xl border border-white/20 text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">10,000+</div>
              <div className="text-sm text-foreground/60">Students Helped</div>
            </CardContent>
          </Card>
          <Card className="bg-card/60 backdrop-blur-xl border border-white/20 text-center">
            <CardContent className="p-6">
              <HelpCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">98%</div>
              <div className="text-sm text-foreground/60">Issue Resolution Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Options */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              Contact Our Team
            </CardTitle>
            <p className="text-foreground/60">
              Choose the right team for your inquiry to get the fastest response.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contactOptions.map((option) => (
                <Card key={option.title} className="bg-background/50 border border-white/20 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <option.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{option.title}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          Response: {option.responseTime}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-foreground/70 text-sm mb-4">{option.description}</p>
                    <a
                      href={`mailto:${option.email}`}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium text-sm"
                    >
                      <Mail className="h-4 w-4" />
                      {option.email}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <p className="text-foreground/60">
              Quick answers to the most common questions about AP Ally.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {faq.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{faq.question}</h3>
                  <p className="text-foreground/70 text-sm leading-relaxed">{faq.answer}</p>
                  {index < faqs.length - 1 && (
                    <Separator className="mt-4 bg-white/20" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Need Immediate Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
              <p className="text-foreground/80 mb-4">
                If you're experiencing a critical issue that prevents you from studying for an upcoming exam:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:urgent@ap-ally.com?subject=URGENT: Critical Issue"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <Mail className="h-4 w-4" />
                  urgent@ap-ally.com
                </a>
                <div className="text-sm text-foreground/60 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  We'll respond within 2 hours during business hours
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Official AP Resources</h3>
                <div className="space-y-2">
                  <a
                    href="https://apstudents.collegeboard.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
                  >
                    College Board AP Students
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </a>
                  <a
                    href="https://apcentral.collegeboard.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
                  >
                    AP Central
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </a>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Community</h3>
                <div className="space-y-2">
                  <p className="text-foreground/70 text-sm">
                    Join our community of AP students for study tips, motivation, and peer support.
                  </p>
                  <a
                    href="mailto:community@ap-ally.com"
                    className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
                  >
                    <Users className="h-4 w-4" />
                    community@ap-ally.com
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}