import { Mail, MapPin, ExternalLink, GraduationCap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto bg-card/60 backdrop-blur-xl border-t border-white/20">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
              <h3 className="font-headline text-xl font-bold text-primary">AP Ally</h3>
            </div>
            <p className="text-foreground/70 text-sm leading-relaxed">
              Empowering students with AI-powered AP exam preparation. Personalized learning paths, 
              interactive content, and real-time progress tracking for academic success.
            </p>
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <MapPin className="h-4 w-4" />
              <span>Tokyo, Japan</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/dashboard" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/practice-quiz" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                Practice Quiz
              </Link>
              <Link href="/onboarding" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                Get Started
              </Link>
              <a 
                href="mailto:support@ap-ally.com" 
                className="text-sm text-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                Support
              </a>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/privacy-policy" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookie-policy" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
              <a 
                href="mailto:legal@ap-ally.com" 
                className="text-sm text-foreground/70 hover:text-primary transition-colors"
              >
                Legal Inquiries
              </a>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <nav className="flex flex-col space-y-2">
              <a 
                href="https://apstudents.collegeboard.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
              >
                College Board AP
                <ExternalLink className="h-3 w-3" />
              </a>
              <a 
                href="https://apcentral.collegeboard.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-foreground/70 hover:text-primary transition-colors flex items-center gap-1"
              >
                AP Central
                <ExternalLink className="h-3 w-3" />
              </a>
              <Link href="/help" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                Help Center
              </Link>
              <a 
                href="mailto:feedback@ap-ally.com" 
                className="text-sm text-foreground/70 hover:text-primary transition-colors"
              >
                Send Feedback
              </a>
            </nav>
          </div>
        </div>

        <Separator className="my-8 bg-white/20" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-foreground/60">
            © {currentYear} AP Ally. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4 text-xs text-foreground/50">
            <span>Made with ❤️ for AP students</span>
            <Separator orientation="vertical" className="h-4 bg-white/20" />
            <span>Powered by AI</span>
            <Separator orientation="vertical" className="h-4 bg-white/20" />
<a
              href="https://buymeacoffee.com/lystea"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer group"
            >
              <span>Buy Me a Coffee ☕️</span>
            </a>
          </div>
        </div>

        {/* AdSense Compliance Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-foreground/40">
            This site uses cookies and displays advertisements to support our free educational content. 
            By using our service, you agree to our use of cookies and advertising practices as described in our Privacy Policy.
          </p>
        </div>
      </div>
    </footer>
  );
}