import { ArrowLeft, Shield, Eye, Database, Share2, Cookie, Settings, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - AP Ally",
  description: "Learn how AP Ally protects your privacy and handles your personal information.",
};

export default function PrivacyPolicyPage() {
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
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-headline text-3xl font-bold">Privacy Policy</h1>
              <p className="text-foreground/60">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-foreground/80 leading-relaxed">
              At AP Ally, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our AI-powered AP exam preparation platform. 
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
              please do not access the application.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <p className="text-foreground/70 mb-2">We may collect personal information that you voluntarily provide to us when you:</p>
              <ul className="list-disc list-inside space-y-1 text-foreground/70 ml-4">
                <li>Register for an account</li>
                <li>Use our AI tutoring services</li>
                <li>Contact us for support</li>
                <li>Subscribe to our newsletter</li>
              </ul>
              <p className="text-foreground/70 mt-2">This information may include:</p>
              <ul className="list-disc list-inside space-y-1 text-foreground/70 ml-4">
                <li>Name and email address</li>
                <li>Educational information (grade level, subjects of interest)</li>
                <li>Usage preferences and settings</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Usage Data</h3>
              <p className="text-foreground/70">We automatically collect certain information when you use our platform:</p>
              <ul className="list-disc list-inside space-y-1 text-foreground/70 ml-4">
                <li>IP address and browser information</li>
                <li>Device characteristics and operating system</li>
                <li>Usage patterns and feature interactions</li>
                <li>Quiz responses and learning progress</li>
                <li>Time spent on different sections</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Cookies and Tracking Technologies</h3>
              <p className="text-foreground/70">We use cookies and similar tracking technologies to enhance your experience:</p>
              <ul className="list-disc list-inside space-y-1 text-foreground/70 ml-4">
                <li>Essential cookies for platform functionality</li>
                <li>Analytics cookies to understand usage patterns</li>
                <li>Advertising cookies for relevant ad display</li>
                <li>Preference cookies to remember your settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-primary" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/70">
              <li><strong>Provide personalized learning:</strong> Create customized study plans and AI-generated content based on your learning patterns</li>
              <li><strong>Improve our services:</strong> Analyze usage data to enhance platform features and user experience</li>
              <li><strong>Communicate with you:</strong> Send important updates, educational content, and respond to inquiries</li>
              <li><strong>Ensure platform security:</strong> Monitor for suspicious activity and protect against unauthorized access</li>
              <li><strong>Display relevant advertisements:</strong> Show targeted ads through Google AdSense to support our free services</li>
              <li><strong>Comply with legal obligations:</strong> Meet regulatory requirements and respond to legal requests</li>
            </ul>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-primary" />
              How We Share Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">We may share your information in the following situations:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/70">
              <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our platform (hosting, analytics, payment processing)</li>
              <li><strong>Google AdSense:</strong> Aggregated and anonymized data for ad targeting and measurement</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              <li><strong>Consent:</strong> With your explicit permission for specific purposes</li>
            </ul>
            <p className="text-foreground/70 mt-4">
              <strong>We do not sell your personal information to third parties.</strong>
            </p>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">We implement appropriate security measures to protect your information:</p>
            <ul className="list-disc list-inside space-y-1 text-foreground/70">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication measures</li>
              <li>Secure data centers and infrastructure</li>
            </ul>
            <p className="text-foreground/70 mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. 
              While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/70">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Cookie Control:</strong> Manage cookie preferences through your browser settings</li>
            </ul>
            <p className="text-foreground/70 mt-4">
              To exercise these rights, please contact us at{" "}
              <a href="mailto:privacy@apally.com" className="text-primary hover:underline">
                privacy@apally.com
              </a>.
            </p>
          </CardContent>
        </Card>

        {/* Google AdSense */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Cookie className="h-5 w-5 text-primary" />
              Google AdSense and Advertising
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              We use Google AdSense to display advertisements on our platform. Google AdSense uses cookies 
              and other tracking technologies to serve ads based on your interests and previous visits to our site.
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/70">
              <li>Google's use of advertising cookies enables it to serve ads based on your visit to our site and other sites</li>
              <li>You may opt out of personalized advertising by visiting Google's Ads Settings</li>
              <li>Third-party vendors may display ads on sites across the Internet based on previous visits to our website</li>
            </ul>
            <p className="text-foreground/70 mt-4">
              For more information about Google's privacy practices, please visit{" "}
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google's Privacy Policy
              </a>.
            </p>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Children's Privacy (COPPA)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground/70">
                AP Ally is designed for high school students and does not knowingly collect personal information 
                from children under 13 years of age. We comply with the Children's Online Privacy Protection Act (COPPA).
              </p>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">Important Notice for Parents</h4>
                <p className="text-sm text-amber-700">
                  If you are a parent or guardian and you believe your child under 13 has provided us with 
                  personal information, please contact us immediately at{" "}
                  <a href="mailto:privacy@apally.com" className="text-primary hover:underline">
                    privacy@apally.com
                  </a>. 
                  We will delete such information as quickly as possible.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">COPPA Compliance Measures</h4>
                <ul className="list-disc list-inside space-y-1 text-foreground/70">
                  <li>We do not knowingly collect personal information from children under 13</li>
                  <li>We do not use interest-based advertising targeting children under 13</li>
                  <li>We do not share personal information of children under 13 with third parties</li>
                  <li>We maintain safeguards to protect children's privacy</li>
                  <li>We respond promptly to requests from parents regarding their children's information</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">If You Are Under 13</h4>
                <p className="text-foreground/70">
                  If you are under 13 years old, please do not use AP Ally or provide any personal information 
                  to us. Instead, ask your parent or guardian to help you find age-appropriate educational resources.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Policy Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage 
              you to review this Privacy Policy periodically for any changes.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="space-y-2 text-foreground/70">
              <p><strong>Email:</strong> <a href="mailto:privacy@apally.com" className="text-primary hover:underline">privacy@apally.com</a></p>
              <p><strong>Subject Line:</strong> Privacy Policy Inquiry</p>
            </div>
            <p className="text-foreground/70 mt-4">
              We will respond to your inquiry within 30 days of receipt.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}