// src/lib/api-client.ts

import { Roadmap, APClass } from './types';
import type { GenerateLessonContentOutput } from "@/ai/flows/generate-lesson-content";
import { getAuth } from 'firebase/auth';

async function getAuthToken() {
    const auth = getAuth();
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    if (!token) {
        throw new Error("User not authenticated");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed with status: ' + response.status }));
        
        // Enhanced error handling for AI-related errors
        const errorMessage = errorData.error || 'An unknown error occurred';
        if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        if (response.status >= 500) {
            throw new Error('Service temporarily unavailable. Please try again.');
        }
        if (errorMessage.toLowerCase().includes('overload')) {
            throw new Error('Model overloaded. Please try again in a moment.');
        }
        
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return;
    }

    return response.json();
}

// Class APIs
export const createClassAPI = (courseName: string, testDate?: string): Promise<APClass> => {
    return fetchWithAuth('/api/classes', {
        method: 'POST',
        body: JSON.stringify({ course_name: courseName, test_date: testDate }),
    });
};

export const getClassesAPI = (): Promise<APClass[]> => {
    return fetchWithAuth('/api/classes');
};

export const updateClassAPI = (classId: string, testDate?: string): Promise<{success : boolean}> => {
    return fetchWithAuth(`/api/classes/${classId}`, {
        method: 'PATCH',
        body: JSON.stringify({ test_date: testDate }),
    });
}

export const deleteClassAPI = (classId: string): Promise<void> => {
    return fetchWithAuth(`/api/classes/${classId}`, {
        method: 'DELETE',
    });
}


// Roadmap & Lesson APIs
export const createRoadmapAPI = (roadmap: Roadmap, classId: string): Promise<{ success: boolean, roadmapId: string }> => {
    return fetchWithAuth('/api/lessons', {
        method: 'POST',
        body: JSON.stringify({
            ap_class_id: classId,
            courseName: roadmap.title,
            units: roadmap.units,
        }),
    });
};

export const getRoadmapAPI = (classId?:string): Promise<Roadmap | null> => {
    const url = classId ? `/api/lessons?classId=${classId}` : '/api/lessons'
    return fetchWithAuth(url);
};

export const getLessonContentAPI = (lessonId: string): Promise<GenerateLessonContentOutput> => {
    return fetchWithAuth(`/api/lessons/${lessonId}/content`);
};


// Progress & Mastery APIs
export const updateProgressAPI = (lessonId: string, completed: boolean, mastery?: boolean, quiz_score?: number): Promise<{ success: boolean }> => {
    const payload: { [key: string]: any } = { lessonId, completed };
    if (mastery !== undefined) payload.mastery = mastery;
    if (quiz_score !== undefined) payload.quiz_score = quiz_score;
    
    return fetchWithAuth('/api/progress', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

// Goals APIs
export const getGoalsAPI = (): Promise<any[]> => {
    return fetchWithAuth('/api/goals');
};

export const createGoalAPI = (text: string): Promise<any> => {
    return fetchWithAuth('/api/goals', {
        method: 'POST',
        body: JSON.stringify({ text }),
    });
};

export const updateGoalAPI = (goalId: string, data: { completed: boolean }): Promise<any> => {
    return fetchWithAuth(`/api/goals/${goalId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
};

export const deleteGoalAPI = (goalId: string): Promise<void> => {
    return fetchWithAuth(`/api/goals/${goalId}`, {
        method: 'DELETE',
    });
};

// Practice Quiz APIs
export const generatePracticeQuizAPI = (quizRequest: {
    apCourse: string;
    format: 'mcq' | 'leq' | 'laq' | 'mixed';
    units: string[];
    questionCount: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
}): Promise<any> => {
    return fetchWithAuth('/api/practice-quiz/generate', {
        method: 'POST',
        body: JSON.stringify(quizRequest),
    });
};

export const generateQuizFeedbackAPI = (feedbackRequest: {
    apCourse: string;
    quizData: any;
    answers: Record<string, string>;
}): Promise<any> => {
    return fetchWithAuth('/api/practice-quiz/feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackRequest),
    });
};

export const saveQuizResultAPI = (quizResult: {
    classId: string;
    quizTitle: string;
    quizFormat: string;
    overallScore: number;
    questionsAnswered: number;
    totalQuestions: number;
    timeSpent?: number;
    units: string[];
}): Promise<any> => {
    return fetchWithAuth('/api/practice-quiz/results', {
        method: 'POST',
        body: JSON.stringify(quizResult),
    });
};

export const getQuizResultsAPI = (classId: string): Promise<{ results: any[] }> => {
    return fetchWithAuth(`/api/practice-quiz/results?classId=${classId}`);
};

export const updateQuizResultAPI = (updateData: {
    classId: string;
    quizTitle: string;
    newScore: number;
}): Promise<any> => {
    return fetchWithAuth('/api/practice-quiz/results/update', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
    });
};

// Helper function to check if user has existing classes
export const hasExistingClassesAPI = async (): Promise<boolean> => {
    try {
        const classes = await getClassesAPI();
        return classes.length > 0;
    } catch (error) {
        console.error('Error checking for existing classes:', error);
        return false;
    }
};

// Gamification APIs
export const getGamificationDataAPI = (): Promise<{
    boar_level: number;
    lessons_completed_count: number;
    current_streak: number;
    longest_streak: number;
    last_lesson_date: string | null;
    practice_quizzes_completed: number;
}> => {
    return fetchWithAuth('/api/gamification');
};

export const updateGamificationAPI = (updateData: {
    lessonCompleted?: boolean;
    practiceQuizCompleted?: boolean;
    quizPassed?: boolean;
}): Promise<{
    success: boolean;
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    data: any;
}> => {
    return fetchWithAuth('/api/gamification', {
        method: 'POST',
        body: JSON.stringify(updateData),
    });
};