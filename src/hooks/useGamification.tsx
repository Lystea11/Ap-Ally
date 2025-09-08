"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { getGamificationDataAPI, updateGamificationAPI } from '@/lib/api-client';

interface GamificationData {
  boar_level: number;
  lessons_completed_count: number;
  current_streak: number;
  longest_streak: number;
  last_lesson_date: string | null;
  practice_quizzes_completed: number;
}

interface GamificationContextType {
  gamificationData: GamificationData | null;
  loading: boolean;
  error: string | null;
  refreshGamificationData: () => Promise<void>;
  updateProgress: (updates: {
    lessonCompleted?: boolean;
    practiceQuizCompleted?: boolean;
    quizPassed?: boolean;
  }) => Promise<{
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
  }>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshGamificationData = async () => {
    if (!isAuthenticated || !user) {
      setGamificationData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getGamificationDataAPI();
      setGamificationData(data);
    } catch (err) {
      console.error('Failed to fetch gamification data:', err);
      setError('Failed to load gamification data');
      setGamificationData(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: {
    lessonCompleted?: boolean;
    practiceQuizCompleted?: boolean;
    quizPassed?: boolean;
  }) => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await updateGamificationAPI(updates);
      
      // Refresh data to get latest values
      await refreshGamificationData();
      
      return {
        leveledUp: response.leveledUp,
        oldLevel: response.oldLevel,
        newLevel: response.newLevel,
      };
    } catch (err) {
      console.error('Failed to update gamification progress:', err);
      throw err;
    }
  };

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshGamificationData();
    } else {
      setGamificationData(null);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  return (
    <GamificationContext.Provider 
      value={{
        gamificationData,
        loading,
        error,
        refreshGamificationData,
        updateProgress,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}