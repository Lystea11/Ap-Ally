"use client";

import { useContext } from "react";
import { StudyContext } from "@/context/StudyContext";

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error("useStudy must be used within a StudyProvider");
  }
  return context;
};
