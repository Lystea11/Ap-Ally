import { ArrowLeft, Cookie, Settings, Eye, Database, AlertCircle, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Cookie Policy - AP Ally",
  description: "Learn about how AP Ally uses cookies and tracking technologies.",
};

export default function CookiePolicyPage() {
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
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-headline text-3xl font-bold">Cookie Policy</h1>
              <p className="text-foreground/60">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="text-foreground/80 leading-relaxed">
              This Cookie Policy explains how AP Ally ("we," "our," or "us") uses cookies and similar 
              tracking technologies when you visit our website and use our AI-powered AP exam preparation 
              platform. This policy explains what these technologies are, why we use them, and your rights 
              to control our use of them.
            </p>
          </CardContent>
        </Card>

        {/* What are Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              What Are Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              Cookies are small data files that are placed on your computer or mobile device when you 
              visit a website. Cookies are widely used by website owners to make their websites work 
              more efficiently, provide reporting information, and deliver personalized experiences.
            </p>
            <p className="text-foreground/70">
              We also use similar tracking technologies like web beacons, pixels, and local storage 
              to collect information about how you use our platform.
            </p>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-primary" />
              Types of Cookies We Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Essential Cookies */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-green-600" />
                Essential Cookies (Always Active)
              </h3>
              <p className="text-foreground/70 mb-2">
                These cookies are necessary for the website to function and cannot be switched off. 
                They are usually only set in response to actions made by you which amount to a request for services.
              </p>
              <ul className="list-disc list-inside space-y-1 text-foreground/70 ml-4">
                <li>Authentication cookies to keep you logged in</li>
                <li>Security cookies to protect against fraud</li>
                <li>Load balancing cookies to distribute server load</li>
                <li>User interface customization cookies</li>
              </ul>
            </div>

            <Separator />

            {/* Performance Cookies */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-600" />
                Performance and Analytics Cookies
              </h3>
              <p className="text-foreground/70 mb-2">
                These cookies help us understand how visitors interact with our website by collecting 
                and reporting information anonymously.
              </p>
              <ul className="list-disc list-inside space-y-1 text-foreground/70 ml-4">
                <li>Google Analytics cookies to measure website usage</li>
                <li>Performance monitoring cookies to track loading times</li>
                <li>Error tracking cookies to identify technical issues</li>
                <li>A/B testing cookies to optimize user experience</li>
              </ul>
              <p className="text-foreground/60 text-sm mt-2">
                These cookies collect aggregated data and do not identify individual users.
              </p>
            </div>

            <Separator />

            {/* Functional Cookies */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-600" />
                Functional Cookies
              </h3>
              <p className="text-foreground/70 mb-2">
                These cookies enable enhanced functionality and personalization to improve your experience.
              </p>
              <ul className="list-disc list-inside space-y-1 text-foreground/70 ml-4">
                <li>Language preference cookies</li>
                <li>Theme and display preference cookies</li>
                <li>Study progress and settings cookies</li>
                <li>Feature usage preference cookies</li>
              </ul>
            </div>

            <Separator />

            {/* Advertising Cookies */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-600" />
                Advertising and Targeting Cookies
              </h3>
              <p className="text-foreground/70 mb-2">
                These cookies are used to deliver advertisements that are relevant to you and your interests. 
                They are set by our advertising partners through our site.
              </p>
              <ul className="list-disc list-inside space-y-1 text-foreground/70 ml-4">
                <li>Google AdSense cookies for personalized advertising</li>
                <li>Interest-based advertising cookies</li>
                <li>Conversion tracking cookies</li>
                <li>Retargeting cookies for relevant ads</li>
              </ul>
              <p className="text-foreground/60 text-sm mt-2">
                These cookies may track your browsing activity across other websites.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Third-Party Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70 mb-4">
              We work with several third-party services that may place cookies on your device:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Google Services</h4>
                <ul className="list-disc list-inside space-y-1 text-foreground/70 text-sm">
                  <li>Google Analytics (Analytics)</li>
                  <li>Google AdSense (Advertising)</li>
                  <li>Google Fonts (Performance)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Other Services</h4>
                <ul className="list-disc list-inside space-y-1 text-foreground/70 text-sm">
                  <li>Vercel Analytics (Performance)</li>
                  <li>Firebase (Authentication)</li>
                  <li>Supabase (Database)</li>
                </ul>
              </div>
            </div>
            <p className="text-foreground/70 mt-4 text-sm">
              Each third-party service has its own privacy policy and cookie practices. We recommend 
              reviewing their policies for more information.
            </p>
          </CardContent>
        </Card>

        {/* Cookie Duration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Cookie Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Session Cookies</h3>
                <p className="text-foreground/70">
                  These cookies are temporary and are deleted when you close your browser. They are 
                  used for essential functions like maintaining your login status during your visit.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Persistent Cookies</h3>
                <p className="text-foreground/70">
                  These cookies remain on your device for a set period (ranging from days to years) 
                  or until you delete them. They remember your preferences and provide personalized experiences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-primary" />
              Managing Your Cookie Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Browser Settings</h3>
              <p className="text-foreground/70 mb-2">
                You can control and manage cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-foreground/70">
                <li>View which cookies are stored on your device</li>
                <li>Delete all cookies or specific cookies</li>
                <li>Block cookies from specific sites</li>
                <li>Block all third-party cookies</li>
                <li>Clear all cookies when you close the browser</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Advertising Preferences</h3>
              <p className="text-foreground/70 mb-2">
                You can opt out of personalized advertising through these services:
              </p>
              <ul className="list-disc list-inside space-y-1 text-foreground/70">
                <li>
                  <a 
                    href="https://adssettings.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Ads Settings
                  </a>
                </li>
                <li>
                  <a 
                    href="http://optout.aboutads.info/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Digital Advertising Alliance Opt-Out
                  </a>
                </li>
                <li>
                  <a 
                    href="http://optout.networkadvertising.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Network Advertising Initiative Opt-Out
                  </a>
                </li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Impact of Blocking Cookies</h3>
              <p className="text-foreground/70">
                Please note that blocking or deleting cookies may impact your experience on AP Ally. 
                Some features may not work properly, and you may need to re-enter your preferences each time you visit.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to This Cookie Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/70">
              We may update this Cookie Policy from time to time to reflect changes in technology, 
              legislation, or our cookie practices. We will notify you of any material changes by 
              posting the updated policy on this page and updating the "Last updated" date.
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
              If you have any questions about this Cookie Policy or our use of cookies, please contact us:
            </p>
            <div className="space-y-2 text-foreground/70">
              <p><strong>Email:</strong> <a href="mailto:privacy@apally.com" className="text-primary hover:underline">privacy@apally.com</a></p>
              <p><strong>Subject Line:</strong> Cookie Policy Inquiry</p>
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