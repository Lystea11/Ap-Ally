"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Shield, Cookie, Eye, Database, Settings, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface ConsentPreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
}

export default function PrivacySettingsPage() {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    functional: true,
    analytics: true,
    advertising: true,
  });
  const [hasConsent, setHasConsent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load current preferences from localStorage
    const consent = localStorage.getItem("ap-ally-cookie-consent");
    if (consent) {
      setHasConsent(true);
      const savedPreferences = localStorage.getItem("ap-ally-consent-preferences");
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const updatePreference = (type: keyof ConsentPreferences, value: boolean) => {
    if (type === 'essential') return; // Essential cookies can't be disabled
    
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  const savePreferences = () => {
    localStorage.setItem("ap-ally-cookie-consent", "true");
    localStorage.setItem("ap-ally-consent-preferences", JSON.stringify(preferences));
    
    toast({
      title: "Privacy Settings Updated",
      description: "Your cookie preferences have been saved. The page will reload to apply changes.",
    });
    
    // Reload to apply new settings
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const resetToDefaults = () => {
    const defaultPreferences = {
      essential: true,
      functional: true,
      analytics: true,
      advertising: true,
    };
    
    setPreferences(defaultPreferences);
    localStorage.setItem("ap-ally-consent-preferences", JSON.stringify(defaultPreferences));
    
    toast({
      title: "Reset to Defaults",
      description: "Your privacy settings have been reset to default values.",
    });
  };

  const clearAllData = () => {
    // Clear all localStorage data
    localStorage.removeItem("ap-ally-cookie-consent");
    localStorage.removeItem("ap-ally-consent-preferences");
    
    // Clear any other app-specific data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("ap-ally-")) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    toast({
      title: "Data Cleared",
      description: "All stored data has been cleared. The page will reload.",
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

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
              <h1 className="font-headline text-3xl font-bold">Privacy Settings</h1>
              <p className="text-foreground/60">Manage your data and cookie preferences</p>
            </div>
          </div>
        </div>

        {!hasConsent ? (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <Cookie className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Cookie Preferences Set</h3>
              <p className="text-muted-foreground mb-4">
                You haven't set your cookie preferences yet. Visit the homepage to configure your settings.
              </p>
              <Link href="/">
                <Button>Go to Homepage</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cookie Preferences */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Cookie className="h-5 w-5 text-primary" />
                  Cookie Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Essential Cookies */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="essential" className="font-medium">Essential Cookies</Label>
                      <Badge variant="outline" className="text-xs">Required</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Necessary for the website to function properly. These cannot be disabled.
                    </p>
                  </div>
                  <Switch
                    id="essential"
                    checked={preferences.essential}
                    disabled={true}
                    className="ml-4"
                  />
                </div>

                {/* Functional Cookies */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="functional" className="font-medium">Functional Cookies</Label>
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Remember your preferences and settings for a better experience.
                    </p>
                  </div>
                  <Switch
                    id="functional"
                    checked={preferences.functional}
                    onCheckedChange={(checked) => updatePreference('functional', checked)}
                    className="ml-4"
                  />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="analytics" className="font-medium">Analytics Cookies</Label>
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how you use our website to improve it.
                    </p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => updatePreference('analytics', checked)}
                    className="ml-4"
                  />
                </div>

                {/* Advertising Cookies */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="advertising" className="font-medium">Advertising Cookies</Label>
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Show you relevant ads to support our free educational content.
                    </p>
                  </div>
                  <Switch
                    id="advertising"
                    checked={preferences.advertising}
                    onCheckedChange={(checked) => updatePreference('advertising', checked)}
                    className="ml-4"
                  />
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={savePreferences} className="flex-1">
                    <Settings className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                  <Button onClick={resetToDefaults} variant="outline" className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Your Data Rights</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You have the right to access, correct, or delete your personal data. 
                      You can also request data portability or object to certain processing.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Access</Badge>
                      <Badge variant="outline">Correction</Badge>
                      <Badge variant="outline">Deletion</Badge>
                      <Badge variant="outline">Portability</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Clear All Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will remove all stored data including your preferences, study progress, 
                      and cookie settings. This action cannot be undone.
                    </p>
                    <Button onClick={clearAllData} variant="destructive">
                      Clear All Data
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Contact Us</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      For data requests or privacy concerns, please contact us at:
                    </p>
                    <div className="text-sm">
                      <p><strong>Email:</strong> <a href="mailto:privacy@apally.com" className="text-primary hover:underline">privacy@apally.com</a></p>
                      <p><strong>Response Time:</strong> Within 30 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* External Links */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-primary" />
                  External Privacy Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Google Ad Settings</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Manage your Google advertising preferences and opt out of personalized ads.
                    </p>
                    <a 
                      href="https://adssettings.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      Visit Google Ad Settings →
                    </a>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Industry Opt-Out Tools</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use industry-standard tools to opt out of interest-based advertising.
                    </p>
                    <div className="space-y-2">
                      <div>
                        <a 
                          href="http://optout.aboutads.info/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Digital Advertising Alliance Opt-Out →
                        </a>
                      </div>
                      <div>
                        <a 
                          href="http://optout.networkadvertising.org/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Network Advertising Initiative Opt-Out →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
}