
"use client";

import React, { createContext, useState, ReactNode, useEffect } from "react";
import { Roadmap, Lesson } from "@/lib/types";

interface StudyContextType {
  roadmap: Roadmap | null;
  setRoadmap: (roadmap: Roadmap) => void;
  updateLessonProgress: (lessonId: string, completed: boolean) => void;
  setLessonMastery: (lessonId: string, achieved: boolean) => void;
  progress: number;
}

export const StudyContext = createContext<StudyContextType | undefined>(
  undefined
);

export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const [roadmap, setRoadmapState] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    try {
      const savedRoadmap = localStorage.getItem("roadmap");
      if (savedRoadmap) {
        setRoadmapState(JSON.parse(savedRoadmap));
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (roadmap) {
      const allLessons = roadmap.units.flatMap((unit) => unit.lessons);
      const completedLessons = allLessons.filter((lesson) => lesson.completed);
      const newProgress =
        allLessons.length > 0
          ? (completedLessons.length / allLessons.length) * 100
          : 0;
      setProgress(newProgress);
      try {
        localStorage.setItem("roadmap", JSON.stringify(roadmap));
      } catch (error) {
        console.error("Could not access localStorage", error);
      }
    }
  }, [roadmap]);

  const setRoadmap = (newRoadmap: Roadmap) => {
    const roadmapWithIds = {
        ...newRoadmap,
        units: newRoadmap.units.map((unit, unitIndex) => ({
            ...unit,
            id: `unit-${unitIndex}`,
            lessons: unit.lessons.map((lesson, lessonIndex) => ({
                ...lesson,
                id: `unit-${unitIndex}-lesson-${lessonIndex}`,
                completed: false,
                mastery: false,
            })),
        })),
    };
    setRoadmapState(roadmapWithIds);
  };

  const updateLessonProgress = (lessonId: string, completed: boolean) => {
    setRoadmapState((prevRoadmap) => {
      if (!prevRoadmap) return null;
      const newRoadmap = {
        ...prevRoadmap,
        units: prevRoadmap.units.map((unit) => ({
          ...unit,
          lessons: unit.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, completed } : lesson
          ),
        })),
      };
      return newRoadmap;
    });
  };

  const setLessonMastery = (lessonId: string, achieved: boolean) => {
    setRoadmapState((prevRoadmap) => {
      if (!prevRoadmap) return null;
      const newRoadmap = {
        ...prevRoadmap,
        units: prevRoadmap.units.map((unit) => ({
          ...unit,
          lessons: unit.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, mastery: achieved } : lesson
          ),
        })),
      };
      return newRoadmap;
    });
  };


  return (
    <StudyContext.Provider
      value={{ roadmap, setRoadmap, updateLessonProgress, setLessonMastery, progress }}
    >
      {children}
    </StudyContext.Provider>
  );
};
