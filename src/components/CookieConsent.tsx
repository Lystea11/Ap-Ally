"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Cookie, Settings, X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CookieConsentProps {
  className?: string;
}

interface ConsentPreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
}

const CONSENT_STORAGE_KEY = "ap-ally-cookie-consent";
const CONSENT_PREFERENCES_KEY = "ap-ally-consent-preferences";

export function CookieConsent({ className }: CookieConsentProps) {
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true, // Always required
    functional: true,
    analytics: true,
    advertising: true,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!consent) {
      setShowConsent(true);
    } else {
      // Load existing preferences
      const savedPreferences = localStorage.getItem(CONSENT_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      advertising: true,
    };
    
    localStorage.setItem(CONSENT_STORAGE_KEY, "true");
    localStorage.setItem(CONSENT_PREFERENCES_KEY, JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setShowConsent(false);
    setShowSettings(false);
    
    // Reload to apply consent settings
    window.location.reload();
  };

  const handleAcceptSelected = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "true");
    localStorage.setItem(CONSENT_PREFERENCES_KEY, JSON.stringify(preferences));
    setShowConsent(false);
    setShowSettings(false);
    
    // Reload to apply consent settings
    window.location.reload();
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
      advertising: false,
    };
    
    localStorage.setItem(CONSENT_STORAGE_KEY, "true");
    localStorage.setItem(CONSENT_PREFERENCES_KEY, JSON.stringify(essentialOnly));
    setPreferences(essentialOnly);
    setShowConsent(false);
    setShowSettings(false);
    
    // Reload to apply consent settings
    window.location.reload();
  };

  const updatePreference = (type: keyof ConsentPreferences, value: boolean) => {
    if (type === 'essential') return; // Essential cookies can't be disabled
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  if (!showConsent) return null;

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50 p-4", className)}>
      <Card className="mx-auto max-w-6xl shadow-2xl border-2 border-primary/20">
        <CardContent className="p-6">
          {!showSettings ? (
            // Basic consent banner
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">We use cookies to enhance your experience</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    We use cookies and similar technologies to provide personalized learning experiences, 
                    analyze site usage, and display relevant advertisements to support our free educational content. 
                    By clicking "Accept All", you consent to our use of cookies.
                  </p>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                    <p className="text-xs text-amber-700">
                      <strong>Important:</strong> If you are under 13 years old, please ask your parent or guardian 
                      for permission before using this website or accepting cookies.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Your privacy is important to us.</span>
                    <Link href="/privacy-policy" className="text-primary hover:underline">
                      Learn more
                    </Link>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSettings(true)}
                  className="text-sm"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Customize Settings
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRejectNonEssential}
                  className="text-sm"
                >
                  Reject Non-Essential
                </Button>
                <Button 
                  onClick={handleAcceptAll}
                  className="text-sm"
                >
                  Accept All Cookies
                </Button>
              </div>
            </div>
          ) : (
            // Detailed settings
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cookie className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-lg">Cookie Preferences</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Choose which cookies you want to allow. You can change these settings at any time.
              </p>
              
              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <Checkbox 
                    checked={preferences.essential}
                    disabled={true}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Essential Cookies</h4>
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These cookies are necessary for the website to function and cannot be switched off. 
                      They are usually only set in response to actions made by you.
                    </p>
                  </div>
                </div>
                
                {/* Functional Cookies */}
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <Checkbox 
                    checked={preferences.functional}
                    onCheckedChange={(checked) => updatePreference('functional', checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Functional Cookies</h4>
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These cookies enable enhanced functionality and personalization, such as remembering 
                      your preferences and settings.
                    </p>
                  </div>
                </div>
                
                {/* Analytics Cookies */}
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <Checkbox 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => updatePreference('analytics', checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Analytics Cookies</h4>
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These cookies help us understand how visitors interact with our website by 
                      collecting and reporting information anonymously.
                    </p>
                  </div>
                </div>
                
                {/* Advertising Cookies */}
                <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <Checkbox 
                    checked={preferences.advertising}
                    onCheckedChange={(checked) => updatePreference('advertising', checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Advertising Cookies</h4>
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These cookies are used to deliver advertisements that are relevant to you and your interests. 
                      They help support our free educational content.
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSettings(false)}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAcceptSelected}
                  className="text-sm"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Utility function to check if a specific cookie type is consented to
export function hasConsentFor(cookieType: keyof ConsentPreferences): boolean {
  if (typeof window === 'undefined') return false;
  
  const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!consent) return false;
  
  const preferences = localStorage.getItem(CONSENT_PREFERENCES_KEY);
  if (!preferences) return false;
  
  const parsedPreferences: ConsentPreferences = JSON.parse(preferences);
  return parsedPreferences[cookieType] || false;
}

// Utility function to get all consent preferences
export function getConsentPreferences(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  
  const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!consent) return null;
  
  const preferences = localStorage.getItem(CONSENT_PREFERENCES_KEY);
  if (!preferences) return null;
  
  return JSON.parse(preferences);
}