// src/context/StudyContext.tsx

import React, { createContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Roadmap, APClass } from "@/lib/types";
import { getRoadmapAPI, createRoadmapAPI, updateProgressAPI, getClassesAPI } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

interface StudyContextType {
  roadmap: Roadmap | null;
  classes: APClass[];
  setRoadmap: (roadmap: Roadmap, classId: string) => Promise<void>;
  updateLessonProgress: (lessonId: string, completed: boolean) => Promise<void>;
  setLessonMastery: (lessonId: string, achieved: boolean, quiz_score?: number) => Promise<void>;
  progress: number;
  loading: boolean;
  refetchRoadmap: (classId?: string) => Promise<void>;
  refetchClasses: () => Promise<void>;
}

export const StudyContext = createContext<StudyContextType | undefined>(
  undefined
);

export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const [roadmap, setRoadmapState] = useState<Roadmap | null>(null);
  const [classes, setClasses] = useState<APClass[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchClasses = useCallback(async () => {
    if (!isAuthenticated) {
      setClasses([]);
      return;
    }
    try {
      const data = await getClassesAPI();
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setClasses([]);
    }
  }, [isAuthenticated]);


  const fetchRoadmap = useCallback(async (classId?: string) => {
    if (!isAuthenticated) {
        setRoadmapState(null);
        setLoading(false);
        return;
    };
    setLoading(true);
    try {
      const data = await getRoadmapAPI(classId);
      setRoadmapState(data);
    } catch (error) {
      console.error("Failed to fetch roadmap:", error);
      setRoadmapState(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    (async () => {
      await fetchClasses();
      // We don't fetch a roadmap by default anymore, it will be fetched by the specific page
      setLoading(false);
    })();
  }, [fetchClasses]);


  useEffect(() => {
    if (roadmap) {
      const allLessons = roadmap.units.flatMap((unit) => unit.lessons);
      const completedLessons = allLessons.filter((lesson) => lesson.completed);
      const newProgress =
        allLessons.length > 0
          ? (completedLessons.length / allLessons.length) * 100
          : 0;
      setProgress(newProgress);
    } else {
        setProgress(0);
    }
  }, [roadmap]);

  const setRoadmap = async (newRoadmap: Roadmap, classId: string) => {
    setLoading(true);
    await createRoadmapAPI(newRoadmap, classId);
    await fetchRoadmap(classId);
  };

  const updateLessonProgress = async (lessonId: string, completed: boolean) => {
    setRoadmapState((prev) => {
        if (!prev) return null;
        return {
            ...prev,
            units: prev.units.map(u => ({
                ...u,
                lessons: u.lessons.map(l => l.id === lessonId ? {...l, completed} : l)
            }))
        };
    });
    try {
        await updateProgressAPI(lessonId, completed);
    } catch (error) {
        console.error("Failed to update progress:", error);
        await fetchRoadmap();
    }
  };

  const setLessonMastery = async (lessonId: string, achieved: boolean, quiz_score?: number) => {
    setRoadmapState((prev) => {
        if (!prev) return null;
        return {
            ...prev,
            units: prev.units.map(u => ({
                ...u,
                lessons: u.lessons.map(l => l.id === lessonId ? {...l, mastery: achieved} : l)
            }))
        };
    });

    try {
        const currentLesson = roadmap?.units.flatMap(u => u.lessons).find(l => l.id === lessonId);
        if (currentLesson) {
          await updateProgressAPI(lessonId, currentLesson.completed, achieved, quiz_score);
        }
    } catch (error) {
        console.error("Failed to set mastery:", error);
        await fetchRoadmap();
    }
  };


  return (
    <StudyContext.Provider
      value={{ roadmap, classes, setRoadmap, updateLessonProgress, setLessonMastery, progress, loading, refetchRoadmap: fetchRoadmap, refetchClasses: fetchClasses }}
    >
      {children}
    </StudyContext.Provider>
  );
};