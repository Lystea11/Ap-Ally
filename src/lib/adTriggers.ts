"use client";

export type AdTriggerType = 
  | "quiz_completion"
  | "lesson_completion"
  | "unit_completion"
  | "roadmap_checkpoint"
  | "practice_quiz_generated"
  | "achievement_unlocked";

export interface AdTriggerConfig {
  type: AdTriggerType;
  achievementTitle: string;
  achievementDescription: string;
  adSlot: string;
  adFormat?: "banner" | "rectangle" | "large-banner";
  cooldownMinutes?: number;
  maxPerDay?: number;
}

export interface AdTriggerEvent {
  type: AdTriggerType;
  context?: Record<string, any>;
  timestamp: number;
}

const AD_TRIGGERS: Record<AdTriggerType, AdTriggerConfig> = {
  quiz_completion: {
    type: "quiz_completion",
    achievementTitle: "Quiz Complete!",
    achievementDescription: "Great job completing your practice quiz! You're one step closer to AP success.",
    adSlot: "5678901234", // Update with your actual ad slot ID
    adFormat: "rectangle",
    cooldownMinutes: 30,
    maxPerDay: 8,
  },
  lesson_completion: {
    type: "lesson_completion",
    achievementTitle: "Lesson Mastered!",
    achievementDescription: "You've successfully completed another lesson. Keep up the excellent work!",
    adSlot: "6789012345", // Update with your actual ad slot ID
    adFormat: "rectangle",
    cooldownMinutes: 20,
    maxPerDay: 10,
  },
  unit_completion: {
    type: "unit_completion",
    achievementTitle: "Unit Complete!",
    achievementDescription: "Congratulations! You've mastered an entire unit. Time to celebrate!",
    adSlot: "7890123456", // Update with your actual ad slot ID
    adFormat: "large-banner",
    cooldownMinutes: 60,
    maxPerDay: 5,
  },
  roadmap_checkpoint: {
    type: "roadmap_checkpoint",
    achievementTitle: "Checkpoint Reached!",
    achievementDescription: "You've hit an important milestone in your AP journey. Well done!",
    adSlot: "8901234567", // Update with your actual ad slot ID
    adFormat: "rectangle",
    cooldownMinutes: 45,
    maxPerDay: 6,
  },
  practice_quiz_generated: {
    type: "practice_quiz_generated",
    achievementTitle: "Quiz Ready!",
    achievementDescription: "Your personalized practice quiz has been generated. Ready to test your knowledge?",
    adSlot: "9012345678", // Update with your actual ad slot ID
    adFormat: "banner",
    cooldownMinutes: 15,
    maxPerDay: 12,
  },
  achievement_unlocked: {
    type: "achievement_unlocked",
    achievementTitle: "Achievement Unlocked!",
    achievementDescription: "You've unlocked a new achievement! Your dedication is paying off.",
    adSlot: "0123456789", // Update with your actual ad slot ID
    adFormat: "rectangle",
    cooldownMinutes: 30,
    maxPerDay: 8,
  },
};

const STORAGE_KEY = "ap_ally_ad_history";

export class AdTriggerManager {
  private static instance: AdTriggerManager;
  private adHistory: AdTriggerEvent[] = [];

  private constructor() {
    this.loadHistory();
  }

  static getInstance(): AdTriggerManager {
    if (!AdTriggerManager.instance) {
      AdTriggerManager.instance = new AdTriggerManager();
    }
    return AdTriggerManager.instance;
  }

  private loadHistory(): void {
    if (typeof window === "undefined") return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.adHistory = JSON.parse(stored);
        // Clean up old entries (older than 7 days)
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        this.adHistory = this.adHistory.filter(event => event.timestamp > weekAgo);
      }
    } catch (error) {
      console.error("Error loading ad history:", error);
      this.adHistory = [];
    }
  }

  private saveHistory(): void {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.adHistory));
    } catch (error) {
      console.error("Error saving ad history:", error);
    }
  }

  private getEventsToday(type: AdTriggerType): AdTriggerEvent[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    return this.adHistory.filter(
      event => event.type === type && event.timestamp >= todayTimestamp
    );
  }

  private getLastEvent(type: AdTriggerType): AdTriggerEvent | null {
    return this.adHistory
      .filter(event => event.type === type)
      .sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  }

  canShowAd(type: AdTriggerType, context?: Record<string, any>): boolean {
    const config = AD_TRIGGERS[type];
    if (!config) return false;

    // Check daily limit
    const todayEvents = this.getEventsToday(type);
    if (todayEvents.length >= (config.maxPerDay || 10)) {
      return false;
    }

    // Check cooldown
    const lastEvent = this.getLastEvent(type);
    if (lastEvent && config.cooldownMinutes) {
      const cooldownMs = config.cooldownMinutes * 60 * 1000;
      const timeSinceLastAd = Date.now() - lastEvent.timestamp;
      if (timeSinceLastAd < cooldownMs) {
        return false;
      }
    }

    return true;
  }

  triggerAd(type: AdTriggerType, context?: Record<string, any>): AdTriggerConfig | null {
    if (!this.canShowAd(type, context)) {
      return null;
    }

    const config = AD_TRIGGERS[type];
    if (!config) return null;

    // Record the event
    const event: AdTriggerEvent = {
      type,
      context,
      timestamp: Date.now(),
    };

    this.adHistory.push(event);
    this.saveHistory();

    return config;
  }

  getConfig(type: AdTriggerType): AdTriggerConfig | null {
    return AD_TRIGGERS[type] || null;
  }

  // Analytics methods
  getAdStats(): {
    totalAdsToday: number;
    adsByType: Record<AdTriggerType, number>;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todayEvents = this.adHistory.filter(event => event.timestamp >= todayTimestamp);
    
    const adsByType = {} as Record<AdTriggerType, number>;
    Object.keys(AD_TRIGGERS).forEach(type => {
      adsByType[type as AdTriggerType] = todayEvents.filter(event => event.type === type).length;
    });

    return {
      totalAdsToday: todayEvents.length,
      adsByType,
    };
  }
}