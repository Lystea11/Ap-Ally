"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AdTriggerManager, AdTriggerType, AdTriggerConfig } from "@/lib/adTriggers";
import { useAdSense } from "@/hooks/useAdSense";

interface AdContextType {
  showAd: (type: AdTriggerType, context?: Record<string, any>) => void;
  isAdVisible: boolean;
  currentAdConfig: AdTriggerConfig | null;
  closeAd: () => void;
  isAdSenseLoaded: boolean;
  adSenseError: string | null;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

interface AdProviderProps {
  children: ReactNode;
  enabled?: boolean;
  clientId?: string;
}

export function AdProvider({ 
  children, 
  enabled = true, 
  clientId = "ca-pub-6379242266018309" 
}: AdProviderProps) {
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [currentAdConfig, setCurrentAdConfig] = useState<AdTriggerConfig | null>(null);
  
  const { isLoaded: isAdSenseLoaded, error: adSenseError } = useAdSense({
    clientId,
    enabled,
  });

  const showAd = useCallback((type: AdTriggerType, context?: Record<string, any>) => {
    if (!enabled || !isAdSenseLoaded) return;

    const triggerManager = AdTriggerManager.getInstance();
    const config = triggerManager.triggerAd(type, context);
    
    if (config) {
      setCurrentAdConfig(config);
      setIsAdVisible(true);
    }
  }, [enabled, isAdSenseLoaded]);

  const closeAd = useCallback(() => {
    setIsAdVisible(false);
    setCurrentAdConfig(null);
  }, []);

  const contextValue: AdContextType = {
    showAd,
    isAdVisible,
    currentAdConfig,
    closeAd,
    isAdSenseLoaded,
    adSenseError,
  };

  return (
    <AdContext.Provider value={contextValue}>
      {children}
    </AdContext.Provider>
  );
}

export function useAd() {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error("useAd must be used within an AdProvider");
  }
  return context;
}

// Convenience hook for triggering specific ad types
export function useAdTrigger() {
  const { showAd } = useAd();
  
  return {
    triggerQuizCompletionAd: (context?: Record<string, any>) => showAd("quiz_completion", context),
    triggerLessonCompletionAd: (context?: Record<string, any>) => showAd("lesson_completion", context),
    triggerUnitCompletionAd: (context?: Record<string, any>) => showAd("unit_completion", context),
    triggerRoadmapCheckpointAd: (context?: Record<string, any>) => showAd("roadmap_checkpoint", context),
    triggerPracticeQuizGeneratedAd: (context?: Record<string, any>) => showAd("practice_quiz_generated", context),
    triggerAchievementUnlockedAd: (context?: Record<string, any>) => showAd("achievement_unlocked", context),
  };
}