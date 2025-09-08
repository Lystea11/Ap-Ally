"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export interface AdSenseConfig {
  clientId: string;
  enabled: boolean;
}

export interface AdOptions {
  slot: string;
  format?: "banner" | "rectangle" | "large-banner";
  responsive?: boolean;
}

export function useAdSense(config: AdSenseConfig) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config.enabled) return;
    
    const loadAdSense = async () => {
      if (typeof window === "undefined") return;
      
      // Check if AdSense is already loaded
      if (window.adsbygoogle) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already in DOM
      const existingScript = document.querySelector(
        `script[src*="googlesyndication.com/pagead/js/adsbygoogle.js"]`
      );
      
      if (existingScript) {
        setIsLoaded(true);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Create and load the AdSense script
        const script = document.createElement("script");
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.clientId}`;
        script.async = true;
        script.crossOrigin = "anonymous";
        
        script.onload = () => {
          setIsLoaded(true);
          setIsLoading(false);
        };
        
        script.onerror = () => {
          setError("Failed to load AdSense script");
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (err) {
        setError("Error loading AdSense");
        setIsLoading(false);
      }
    };

    loadAdSense();
  }, [config.enabled, config.clientId]);

  const initializeAd = (options: AdOptions) => {
    if (!isLoaded || !window.adsbygoogle) {
      console.warn("AdSense not loaded yet");
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("Error initializing AdSense ad:", error);
    }
  };

  const refreshAd = () => {
    if (!isLoaded || !window.adsbygoogle) return;
    
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("Error refreshing AdSense ad:", error);
    }
  };

  return {
    isLoaded,
    isLoading,
    error,
    initializeAd,
    refreshAd,
  };
}