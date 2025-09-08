"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BoarAvatar, getNextBoarLevelRequirements } from "@/components/BoarAvatar";
import { Sparkles, Trophy, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoarLevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  lessonsCompleted?: number;
  currentStreak?: number;
  practiceQuizzes?: number;
}

const LEVEL_TITLES = {
  1: "Apprentice Elephant",
  2: "Scholar Elephant", 
  3: "Master Elephant"
} as const;

const LEVEL_DESCRIPTIONS = {
  1: "Ready to start your learning journey!",
  2: "You've proven your dedication to learning!",
  3: "You've reached the pinnacle of academic excellence!"
} as const;

const CELEBRATION_MESSAGES = {
  1: "Welcome to your learning adventure!",
  2: "Outstanding progress! You're becoming a true scholar!",
  3: "Incredible achievement! You're now a Master of Learning!"
} as const;

function ConfettiAnimation() {
  const confettiPieces = Array.from({ length: 50 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confettiPieces.map((i) => (
        <div
          key={i}
          className={cn(
            "absolute animate-bounce",
            i % 4 === 0 && "text-yellow-400",
            i % 4 === 1 && "text-red-400", 
            i % 4 === 2 && "text-blue-400",
            i % 4 === 3 && "text-green-400"
          )}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`
          }}
        >
          {i % 6 === 0 && "🎉"}
          {i % 6 === 1 && "✨"}
          {i % 6 === 2 && "🌟"}
          {i % 6 === 3 && "🎊"}
          {i % 6 === 4 && "⭐"}
          {i % 6 === 5 && "🎈"}
        </div>
      ))}
    </div>
  );
}

export function BoarLevelUpModal({ 
  isOpen, 
  onClose, 
  oldLevel, 
  newLevel,
  lessonsCompleted = 0,
  currentStreak = 0,
  practiceQuizzes = 0
}: BoarLevelUpModalProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true);
      
      // Play a celebration sound if available
      if (typeof window !== 'undefined' && 'Audio' in window) {
        try {
          // You can add a celebration sound file later
          // const audio = new Audio('/celebration.mp3');
          // audio.play().catch(() => {}); // Ignore errors if audio fails
        } catch (error) {
          // Silently fail if audio is not supported
        }
      }
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  const validNewLevel = Math.min(Math.max(newLevel, 1), 3) as 1 | 2 | 3;
  const validOldLevel = Math.min(Math.max(oldLevel, 1), 3) as 1 | 2 | 3;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-2 border-yellow-200">
        {showAnimation && <ConfettiAnimation />}
        
        <DialogHeader className="text-center space-y-4 relative z-10">
          <div className="flex items-center justify-center">
            <div className="relative">
              <Sparkles className="absolute -top-2 -left-2 h-6 w-6 text-yellow-500 animate-spin" />
              <Trophy className="h-8 w-8 text-yellow-600" />
              <Sparkles className="absolute -bottom-1 -right-2 h-5 w-5 text-orange-500 animate-pulse" />
            </div>
          </div>
          
          <DialogTitle className="font-headline text-2xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Boar Evolution Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 relative z-10">
          {/* Before and After */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center space-y-2">
              <BoarAvatar boarLevel={validOldLevel} size="lg" className="mx-auto" />
              <Badge variant="secondary" className="text-xs">
                Level {validOldLevel}
              </Badge>
            </div>
            
            <ArrowRight className="h-6 w-6 text-muted-foreground animate-pulse" />
            
            <div className="text-center space-y-2">
              <div className="relative">
                <BoarAvatar boarLevel={validNewLevel} size="lg" className="mx-auto animate-pulse" />
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-30 animate-ping" />
              </div>
              <Badge className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                Level {validNewLevel}
              </Badge>
            </div>
          </div>

          {/* New Title */}
          <div className="text-center space-y-2">
            <h3 className="font-headline text-xl text-foreground">
              {LEVEL_TITLES[validNewLevel]}
            </h3>
            <p className="text-sm text-muted-foreground">
              {LEVEL_DESCRIPTIONS[validNewLevel]}
            </p>
          </div>

          {/* Achievement Stats */}
          <div className="bg-white/60 rounded-lg p-4 space-y-3 border border-orange-200">
            <h4 className="font-semibold text-sm text-center flex items-center justify-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              Your Achievements
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs text-center">
              <div>
                <div className="font-semibold text-lg text-blue-600">{lessonsCompleted}</div>
                <div className="text-muted-foreground">Lessons</div>
              </div>
              <div>
                <div className="font-semibold text-lg text-green-600">{currentStreak}</div>
                <div className="text-muted-foreground">Day Streak</div>
              </div>
              <div>
                <div className="font-semibold text-lg text-purple-600">{practiceQuizzes}</div>
                <div className="text-muted-foreground">Quizzes</div>
              </div>
            </div>
          </div>

          {/* Next Goal */}
          {validNewLevel < 3 && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-800 text-center">
                <strong>Next Goal:</strong> {getNextBoarLevelRequirements(validNewLevel)}
              </p>
            </div>
          )}

          {/* Celebration Message */}
          <div className="text-center">
            <p className="text-sm font-medium text-orange-700 mb-4">
              {CELEBRATION_MESSAGES[validNewLevel]}
            </p>
            
            <Button 
              onClick={onClose} 
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
            >
              Continue Learning! 🚀
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}