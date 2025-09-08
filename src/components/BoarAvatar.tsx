"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BoarAvatarProps {
  boarLevel?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  fallbackText?: string;
}

const BOAR_LEVELS = {
  1: "/Elephant1.png",
  2: "/Elephant2.png", 
  3: "/Elephant3.png"
} as const;

const BOAR_NAMES = {
  1: "Apprentice Elephant",
  2: "Scholar Elephant", 
  3: "Master Elephant"
} as const;

const SIZE_CLASSES = {
  sm: "h-8 w-8",
  md: "h-10 w-10", 
  lg: "h-16 w-16"
} as const;

const BADGE_COLORS = {
  1: "bg-slate-100 text-slate-800 border-slate-300",
  2: "bg-blue-100 text-blue-800 border-blue-300",
  3: "bg-amber-100 text-amber-800 border-amber-300"
} as const;

export function BoarAvatar({ 
  boarLevel = 1, 
  className = "", 
  size = "md", 
  showBadge = false,
  fallbackText = "B"
}: BoarAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Clamp boar level to valid range
  const validBoarLevel = Math.min(Math.max(boarLevel, 1), 3) as 1 | 2 | 3;
  const boarImage = BOAR_LEVELS[validBoarLevel];
  const boarName = BOAR_NAMES[validBoarLevel];

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    
    // Preload the image
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = boarImage;
  }, [boarLevel, boarImage]);

  return (
    <div className="relative inline-block">
      <Avatar 
        className={cn(
          SIZE_CLASSES[size],
          "ring-2 ring-transparent transition-all duration-200",
          "hover:ring-primary/20",
          imageLoaded && !imageError && "animate-in fade-in duration-300",
          className
        )}
      >
        <AvatarImage
          src={boarImage}
          alt={boarName}
          className={cn(
            "object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        <AvatarFallback 
          className={cn(
            "bg-primary/10 text-primary font-semibold text-sm",
            BADGE_COLORS[validBoarLevel]
          )}
        >
          {fallbackText}
        </AvatarFallback>
      </Avatar>
      
      {showBadge && (
        <Badge 
          variant="secondary" 
          className={cn(
            "absolute -bottom-1 -right-1 px-1 py-0 text-xs font-bold border-2 border-background",
            BADGE_COLORS[validBoarLevel],
            size === "sm" && "text-[10px] px-1"
          )}
        >
          {validBoarLevel}
        </Badge>
      )}
    </div>
  );
}

// Re-export from utils for convenience
export { getBoarLevelFromProgress, getNextBoarLevelRequirements } from '@/lib/gamification-utils';