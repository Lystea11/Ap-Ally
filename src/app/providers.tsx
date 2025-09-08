"use client";

import { AuthProvider } from "@/context/AuthContext";
import { StudyProvider } from "@/context/StudyContext";
import { AdProvider, useAd } from "@/context/AdContext";
import { GamificationProvider } from "@/hooks/useGamification";
import { AdSenseModal } from "@/components/AdSenseModal";
import { ReactNode } from "react";

function AdModalRenderer() {
  const { isAdVisible, currentAdConfig, closeAd } = useAd();
  
  if (!isAdVisible || !currentAdConfig) return null;
  
  return (
    <AdSenseModal
      isOpen={isAdVisible}
      onClose={closeAd}
      achievementTitle={currentAdConfig.achievementTitle}
      achievementDescription={currentAdConfig.achievementDescription}
      adSlot={currentAdConfig.adSlot}
      adFormat={currentAdConfig.adFormat}
    />
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <GamificationProvider>
        <StudyProvider>
          <AdProvider>
            {children}
            <AdModalRenderer />
          </AdProvider>
        </StudyProvider>
      </GamificationProvider>
    </AuthProvider>
  );
}
