import { ArrowLeft, FileText, AlertTriangle, Shield, CreditCard, Users, Gavel, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service - AP Ally",
  description: "Terms and conditions for using AP Ally's AI-powered AP exam preparation platform.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "January 14, 2025";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 -ml-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-headline text-3xl font-bold">Terms of Service</h1>
              <p className="text-foreground/60">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-foreground/80 leading-relaxed">
              Welcome to AP Ally! These Terms of Service ("Terms") govern your use of our AI-powered AP exam 
              preparation platform operated by AP Ally ("we," "our," or "us"). By accessing or using our 
              service, you agree to be bound by these Terms. If you disagree with any part of these terms, 
              then you may not access the service.
            </p>
          </CardContent>
        </Card>

        {/* Acceptance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Gavel className="h-5 w-5 text-primary" />
              Acceptance of Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              By creating an account or using AP Ally, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms and our Privacy Policy. These Terms apply to all 
              visitors, users, and others who access or use the service.
            </p>
            <p className="text-foreground/70">
              If you are using AP Ally on behalf of an organization, you represent and warrant that 
              you have the authority to bind that organization to these Terms.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Description of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              AP Ally is an AI-powered educational platform that provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/70">
              <li>Personalized AP exam preparation content</li>
              <li>Interactive quizzes and practice tests</li>
              <li>AI-generated study plans and recommendations</li>
              <li>Progress tracking and performance analytics</li>
              <li>Educational resources and materials</li>
            </ul>
            <p className="text-foreground/70 mt-4">
              Our service is designed to supplement, not replace, traditional educational instruction 
              and is intended for students preparing for Advanced Placement (AP) examinations.
            </p>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              User Accounts and Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Account Creation</h3>
              <ul className="list-disc list-inside space-y-1 text-foreground/70">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>One person may not maintain multiple accounts</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Acceptable Use</h3>
              <p className="text-foreground/70 mb-2">You agree to use AP Ally only for lawful purposes and in accordance with these Terms. You may not:</p>
              <ul className="list-disc list-inside space-y-1 text-foreground/70">
                <li>Share your account with others or allow unauthorized access</li>
                <li>Use the service for any commercial purpose without our written consent</li>
                <li>Attempt to circumvent any security measures or access restrictions</li>
                <li>Copy, distribute, or create derivative works from our content</li>
                <li>Use automated systems to access or use the service</li>
                <li>Engage in any activity that could harm or interfere with the service</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              The AP Ally platform, including all content, features, and functionality, is owned by 
              AP Ally and is protected by international copyright, trademark, and other intellectual 
              property laws.
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Our Content</h3>
                <p className="text-foreground/70">
                  All educational content, AI-generated materials, graphics, logos, and software 
                  are the exclusive property of AP Ally. You may access and use this content 
                  solely for personal, non-commercial educational purposes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Your Content</h3>
                <p className="text-foreground/70">
                  You retain ownership of any content you submit to AP Ally (such as quiz responses 
                  or feedback). By submitting content, you grant us a license to use, store, and 
                  process this content to provide and improve our services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Free Services</h3>
                <p className="text-foreground/70">
                  AP Ally offers both free and premium features. Free services are supported by 
                  advertising and may have usage limitations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Premium Services</h3>
                <p className="text-foreground/70 mb-2">Premium subscriptions may be offered with additional features:</p>
                <ul className="list-disc list-inside space-y-1 text-foreground/70">
                  <li>All fees are charged in advance and are non-refundable unless otherwise stated</li>
                  <li>Subscription fees are charged on a recurring basis</li>
                  <li>You may cancel your subscription at any time</li>
                  <li>Price changes will be communicated with 30 days notice</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              Privacy and Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              Your privacy is important to us. Our collection and use of personal information is 
              governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <ul className="list-disc list-inside space-y-1 text-foreground/70">
              <li>We use your data to provide personalized learning experiences</li>
              <li>We implement security measures to protect your information</li>
              <li>We may use anonymized data to improve our services</li>
              <li>We display advertisements through Google AdSense</li>
            </ul>
            <p className="text-foreground/70 mt-4">
              Please review our{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{" "}
              for detailed information about our data practices.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Disclaimers and Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Educational Purpose</h3>
              <p className="text-foreground/70">
                AP Ally is an educational tool designed to assist in AP exam preparation. We do not 
                guarantee specific exam scores or outcomes. Success depends on individual effort, 
                study habits, and other factors beyond our control.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Service Availability</h3>
              <p className="text-foreground/70">
                We strive to maintain continuous service availability but do not guarantee uninterrupted 
                access. We may temporarily suspend or restrict access for maintenance, updates, or 
                technical issues.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">AI-Generated Content</h3>
              <p className="text-foreground/70">
                Our platform uses artificial intelligence to generate personalized content. While we 
                strive for accuracy, AI-generated content may occasionally contain errors or 
                inaccuracies. Always verify important information with official sources.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, AP ALLY SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO 
              LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-foreground/70">
              Our total liability to you for any damages arising from or related to these Terms or 
              your use of AP Ally shall not exceed the amount you have paid us in the twelve months 
              preceding the claim.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              We may terminate or suspend your account and access to the service immediately, without 
              prior notice, for any reason, including if you breach these Terms.
            </p>
            <p className="text-foreground/70 mb-4">
              You may terminate your account at any time by contacting us or using the account 
              deletion feature in your settings.
            </p>
            <p className="text-foreground/70">
              Upon termination, your right to use the service will cease immediately, and we may 
              delete your account and associated data.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to These Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70">
              We reserve the right to modify these Terms at any time. We will notify users of 
              material changes by email or through the service. Continued use of AP Ally after 
              changes constitute acceptance of the new Terms. If you do not agree to the modified 
              Terms, you should discontinue use of the service.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70">
              These Terms shall be governed by and construed in accordance with the laws of the 
              United States, without regard to conflict of law principles. Any disputes arising 
              from these Terms or your use of AP Ally shall be resolved through binding arbitration 
              or in the courts of competent jurisdiction in the United States.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-foreground/70">
              <p><strong>Email:</strong> <a href="mailto:legal@apally.com" className="text-primary hover:underline">legal@apally.com</a></p>
              <p><strong>Subject Line:</strong> Terms of Service Inquiry</p>
            </div>
            <p className="text-foreground/70 mt-4">
              We will respond to your inquiry within 30 days of receipt.
            </p>
          </CardContent>
        </Card>

        {/* Acknowledgment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Acknowledgment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70">
              BY USING AP ALLY, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, 
              UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS, 
              YOU ARE NOT AUTHORIZED TO USE THE SERVICE.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}