import { Mail, MapPin, ExternalLink, GraduationCap } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto bg-card/60 backdrop-blur-xl border-t border-white/20">
      <div className="container max-w-7xl mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Company Info */}
          <div className="space-y-3 md:space-y-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
              <h3 className="font-headline text-xl font-bold text-primary">AP Ally</h3>
            </div>
            <p className="text-foreground/70 text-sm leading-relaxed hidden md:block">
              Empowering students with AI-powered AP exam preparation. Personalized learning paths, 
              interactive content, and real-time progress tracking for academic success.
            </p>
            <p className="text-foreground/70 text-sm leading-relaxed md:hidden">
              AI-powered AP exam preparation for student success.
            </p>
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <MapPin className="h-4 w-4" />
              <span>Tokyo, Japan</span>
            </div>
          </div>

          {/* Mobile: Combined Links */}
          <div className="md:hidden grid grid-cols-2 gap-4 col-span-1">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm">Quick Links</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="/dashboard" className="text-xs text-foreground/70 hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/practice-quiz" className="text-xs text-foreground/70 hover:text-primary transition-colors">
                  Practice Quiz
                </Link>
                <Link href="/help" className="text-xs text-foreground/70 hover:text-primary transition-colors">
                  Help Center
                </Link>
              </nav>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm">Legal</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="/privacy-policy" className="text-xs text-foreground/70 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="text-xs text-foreground/70 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <a 
                  href="mailto:support@ap-ally.com" 
                  className="text-xs text-foreground/70 hover:text-primary transition-colors"
                >
                  Support
                </a>
              </nav>
            </div>
          </div>

          {/* Desktop: Quick Links */}
          <div className="space-y-4 hidden md:block">
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

          {/* Desktop: Legal */}
          <div className="space-y-4 hidden md:block">
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
              <Link href="/privacy-settings" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                Privacy Settings
              </Link>
              <a 
                href="mailto:legal@ap-ally.com" 
                className="text-sm text-foreground/70 hover:text-primary transition-colors"
              >
                Legal Inquiries
              </a>
            </nav>
          </div>

          {/* Desktop: Resources */}
          <div className="space-y-4 hidden md:block">
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

        <Separator className="my-4 md:my-8 bg-white/20" />

        {/* Mobile Footer Bottom */}
        <div className="md:hidden">
          <div className="flex flex-col items-center gap-4">
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/personalizedailearning/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card/80 hover:bg-primary/10 transition-all duration-200 group"
                aria-label="Follow us on Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 551.034 551.034"
                  className="text-foreground/70 group-hover:text-primary transition-colors"
                  fill="currentColor"
                >
                  <defs>
                    <linearGradient id="instagram-gradient-mobile" x1="275.517" y1="4.5714" x2="275.517" y2="549.7202">
                      <stop offset="0" stopColor="#E09B3D"/>
                      <stop offset="0.3" stopColor="#C74C4D"/>
                      <stop offset="0.6" stopColor="#C21975"/>
                      <stop offset="1" stopColor="#7024C4"/>
                    </linearGradient>
                  </defs>
                  <path fill="url(#instagram-gradient-mobile)" d="M386.878,0H164.156C73.64,0,0,73.64,0,164.156v222.722
                    c0,90.516,73.64,164.156,164.156,164.156h222.722c90.516,0,164.156-73.64,164.156-164.156V164.156
                    C551.033,73.64,477.393,0,386.878,0z M495.6,386.878c0,60.045-48.677,108.722-108.722,108.722H164.156
                    c-60.045,0-108.722-48.677-108.722-108.722V164.156c0-60.046,48.677-108.722,108.722-108.722h222.722
                    c60.045,0,108.722,48.676,108.722,108.722L495.6,386.878L495.6,386.878z"/>
                  <path fill="url(#instagram-gradient-mobile)" d="M275.517,133C196.933,133,133,196.933,133,275.516
                    s63.933,142.517,142.517,142.517S418.034,354.1,418.034,275.516S354.101,133,275.517,133z M275.517,362.6
                    c-48.095,0-87.083-38.988-87.083-87.083s38.989-87.083,87.083-87.083c48.095,0,87.083,38.988,87.083,87.083
                    C362.6,323.611,323.611,362.6,275.517,362.6z"/>
                  <circle fill="url(#instagram-gradient-mobile)" cx="418.306" cy="134.072" r="34.149"/>
                </svg>
              </a>
              
              <a
                href="https://www.linkedin.com/company/ap-ally/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card/80 hover:bg-primary/10 transition-all duration-200 group"
                aria-label="Connect with us on LinkedIn"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 382 382"
                  className="text-[#0077B7] group-hover:text-primary transition-colors"
                  fill="currentColor"
                >
                  <path d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889
                    C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056
                    H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806
                    c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1
                    s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73
                    c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079
                    c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426
                    c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472
                    L341.91,330.654L341.91,330.654z"/>
                </svg>
              </a>
              
              <a
                href="https://www.tiktok.com/@ap_ally"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card/80 hover:bg-primary/10 transition-all duration-200 group"
                aria-label="Follow us on TikTok"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  className="text-[#09244B] group-hover:text-primary transition-colors"
                  fill="currentColor"
                >
                  <path d="M14,2 C15.1046,2 16,2.89543 16,4 C16,5.44733 17.03,6.6618 18.3984,6.93991 C19.4808,7.15992 20.1799,8.21575 19.9599,9.29819 C19.7399,10.3806 18.6841,11.0798 17.6016,10.8598 C17.0406,10.7457 16.5037,10.5646 16,10.3252 L16,16 C16,19.3137 13.3137,22 10,22 C6.68629,22 4,19.3137 4,16 C4,13.2015 5.91407,10.8551 8.50148,10.1891 C9.57119,9.91382 10.6616,10.5578 10.9369,11.6275 C11.2122,12.6972 10.5682,13.7876 9.49852,14.0629 C8.63547,14.285 8,15.0708 8,16 C8,17.1046 8.89543,18 10,18 C11.1046,18 12,17.1046 12,16 L12,4 C12,2.89543 12.8954,2 14,2 Z"/>
                </svg>
              </a>
            </div>
            
            <div className="text-xs text-center text-foreground/60">
              © {currentYear} AP Ally. All rights reserved.
            </div>
          </div>
        </div>

        {/* Desktop Footer Bottom */}
        <div className="hidden md:flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-foreground/60">
            © {currentYear} AP Ally. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/personalizedailearning/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card/80 hover:bg-primary/10 transition-all duration-200 group"
                aria-label="Follow us on Instagram"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 551.034 551.034"
                  className="text-foreground/70 group-hover:text-primary transition-colors"
                  fill="currentColor"
                >
                  <defs>
                    <linearGradient id="instagram-gradient" x1="275.517" y1="4.5714" x2="275.517" y2="549.7202">
                      <stop offset="0" stopColor="#E09B3D"/>
                      <stop offset="0.3" stopColor="#C74C4D"/>
                      <stop offset="0.6" stopColor="#C21975"/>
                      <stop offset="1" stopColor="#7024C4"/>
                    </linearGradient>
                  </defs>
                  <path fill="url(#instagram-gradient)" d="M386.878,0H164.156C73.64,0,0,73.64,0,164.156v222.722
                    c0,90.516,73.64,164.156,164.156,164.156h222.722c90.516,0,164.156-73.64,164.156-164.156V164.156
                    C551.033,73.64,477.393,0,386.878,0z M495.6,386.878c0,60.045-48.677,108.722-108.722,108.722H164.156
                    c-60.045,0-108.722-48.677-108.722-108.722V164.156c0-60.046,48.677-108.722,108.722-108.722h222.722
                    c60.045,0,108.722,48.676,108.722,108.722L495.6,386.878L495.6,386.878z"/>
                  <path fill="url(#instagram-gradient)" d="M275.517,133C196.933,133,133,196.933,133,275.516
                    s63.933,142.517,142.517,142.517S418.034,354.1,418.034,275.516S354.101,133,275.517,133z M275.517,362.6
                    c-48.095,0-87.083-38.988-87.083-87.083s38.989-87.083,87.083-87.083c48.095,0,87.083,38.988,87.083,87.083
                    C362.6,323.611,323.611,362.6,275.517,362.6z"/>
                  <circle fill="url(#instagram-gradient)" cx="418.306" cy="134.072" r="34.149"/>
                </svg>
              </a>
              
              <a
                href="https://www.linkedin.com/company/ap-ally/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card/80 hover:bg-primary/10 transition-all duration-200 group"
                aria-label="Connect with us on LinkedIn"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 382 382"
                  className="text-[#0077B7] group-hover:text-primary transition-colors"
                  fill="currentColor"
                >
                  <path d="M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889
                    C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056
                    H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806
                    c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1
                    s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73
                    c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079
                    c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426
                    c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472
                    L341.91,330.654L341.91,330.654z"/>
                </svg>
              </a>
              
              <a
                href="https://www.tiktok.com/@ap_ally"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card/80 hover:bg-primary/10 transition-all duration-200 group"
                aria-label="Follow us on TikTok"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  className="text-[#09244B] group-hover:text-primary transition-colors"
                  fill="currentColor"
                >
                  <path d="M14,2 C15.1046,2 16,2.89543 16,4 C16,5.44733 17.03,6.6618 18.3984,6.93991 C19.4808,7.15992 20.1799,8.21575 19.9599,9.29819 C19.7399,10.3806 18.6841,11.0798 17.6016,10.8598 C17.0406,10.7457 16.5037,10.5646 16,10.3252 L16,16 C16,19.3137 13.3137,22 10,22 C6.68629,22 4,19.3137 4,16 C4,13.2015 5.91407,10.8551 8.50148,10.1891 C9.57119,9.91382 10.6616,10.5578 10.9369,11.6275 C11.2122,12.6972 10.5682,13.7876 9.49852,14.0629 C8.63547,14.285 8,15.0708 8,16 C8,17.1046 8.89543,18 10,18 C11.1046,18 12,17.1046 12,16 L12,4 C12,2.89543 12.8954,2 14,2 Z"/>
                </svg>
              </a>
            </div>
            
            <Separator orientation="vertical" className="h-6 bg-white/20" />
            
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
        </div>

        {/* AdSense Compliance Notice */}
        <div className="mt-4 md:mt-6 text-center">
          <p className="text-xs text-foreground/40">
            This site uses cookies and displays advertisements to support our free educational content. 
            By using our service, you agree to our use of cookies and advertising practices as described in our Privacy Policy.
          </p>
        </div>
      </div>
    </footer>
  );
}