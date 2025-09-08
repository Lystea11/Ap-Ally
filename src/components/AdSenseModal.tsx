"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Trophy, Star, Gift, Info, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasConsentFor } from "@/components/CookieConsent";

interface AdSenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievementTitle: string;
  achievementDescription: string;
  adSlot: string;
  adFormat?: "banner" | "rectangle" | "large-banner";
  onAdComplete?: () => void;
  className?: string;
}

export function AdSenseModal({
  isOpen,
  onClose,
  achievementTitle,
  achievementDescription,
  adSlot,
  adFormat = "rectangle",
  onAdComplete,
  className
}: AdSenseModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [hasAdvertisingConsent, setHasAdvertisingConsent] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
      return;
    }
    
    // Check if user has consented to advertising cookies
    setHasAdvertisingConsent(hasConsentFor('advertising'));
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && hasAdvertisingConsent && typeof window !== "undefined" && window.adsbygoogle) {
      // Initialize AdSense ad only if user has consented
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("Error initializing AdSense:", error);
      }
    }
  }, [isOpen, hasAdvertisingConsent]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      onAdComplete?.();
    }, 300);
  };

  if (!isOpen) return null;

  const getAdSize = () => {
    switch (adFormat) {
      case "banner":
        return { width: 728, height: 90 };
      case "large-banner":
        return { width: 970, height: 250 };
      case "rectangle":
      default:
        return { width: 300, height: 250 };
    }
  };

  const adSize = getAdSize();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className={cn(
          "relative w-full max-w-md mx-4 transform transition-all duration-300",
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100",
          className
        )}
      >
        <Card className="shadow-2xl border-2 border-primary/20">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl font-headline text-primary">
              {achievementTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {achievementDescription}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Here's your reward!</span>
              </div>
              <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10">
                Achievement Unlocked
              </Badge>
            </div>

            {/* Advertisement Notice */}
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3" />
                <span>Advertisement</span>
              </div>
            </div>

            {/* Ad Container */}
            <div className="flex justify-center mb-4">
              <div className="bg-muted/30 rounded-lg p-4 min-h-[200px] flex items-center justify-center relative">
                {hasAdvertisingConsent ? (
                  <ins
                    className="adsbygoogle"
                    style={{
                      display: "block",
                      width: `${adSize.width}px`,
                      height: `${adSize.height}px`,
                    }}
                    data-ad-client="ca-pub-6379242266018309"
                    data-ad-slot={adSlot}
                    data-ad-format={adFormat}
                    data-full-width-responsive="true"
                  />
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">
                      Personalized ads are disabled based on your cookie preferences.
                    </p>
                  </div>
                )}
                
                {/* AdChoices Notice */}
                <div className="absolute top-2 right-2">
                  <a 
                    href="https://adssettings.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    title="Ad Settings"
                  >
                    <ExternalLink className="h-3 w-3" />
                    AdChoices
                  </a>
                </div>
              </div>
            </div>

            {/* Ad Information */}
            <div className="text-center mb-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  This ad helps support our free educational content
                </div>
                <div className="text-xs text-muted-foreground">
                  You can manage your ad preferences in your{" "}
                  <a href="/cookie-policy" className="text-primary hover:underline">
                    cookie settings
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <Button
                onClick={handleClose}
                className="bg-primary hover:bg-primary/90 transition-all duration-300"
              >
                <X className="mr-2 h-4 w-4" />
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}