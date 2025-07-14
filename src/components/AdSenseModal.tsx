"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, Trophy, Star, Gift, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [countdown, setCountdown] = useState(3);
  const [canSkip, setCanSkip] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      setCanSkip(false);
      setIsClosing(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.adsbygoogle) {
      // Initialize AdSense ad
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error("Error initializing AdSense:", error);
      }
    }
  }, [isOpen]);

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

            {/* Ad Container */}
            <div className="flex justify-center mb-4">
              <div className="bg-muted/30 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
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
              </div>
            </div>

            {/* Skip Timer */}
            <div className="text-center mb-4">
              {!canSkip ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Skip available in {countdown}s</span>
                  </div>
                  <Progress value={((3 - countdown) / 3) * 100} className="h-2" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-green-600 font-medium">
                    You can now skip this ad
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <Button
                onClick={handleClose}
                disabled={!canSkip}
                className={cn(
                  "transition-all duration-300",
                  canSkip ? "bg-primary hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <X className="mr-2 h-4 w-4" />
                {canSkip ? "Continue" : `Wait ${countdown}s`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}