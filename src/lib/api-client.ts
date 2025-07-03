
import { Roadmap } from './types';
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
        throw new Error(errorData.error || 'An unknown error occurred');
    }

    return response.json();
}

// Roadmap & Lesson APIs
export const createRoadmapAPI = (roadmap: Roadmap): Promise<{ success: boolean, roadmapId: string }> => {
    return fetchWithAuth('/api/lessons', {
        method: 'POST',
        body: JSON.stringify({
            courseName: roadmap.title,
            units: roadmap.units,
        }),
    });
};

export const getRoadmapAPI = (): Promise<Roadmap | null> => {
    return fetchWithAuth('/api/lessons');
};

export const getLessonContentAPI = (lessonId: string): Promise<GenerateLessonContentOutput> => {
    return fetchWithAuth(`/api/lessons/${lessonId}/content`);
};


// Progress & Mastery APIs
export const updateProgressAPI = (lessonId: string, completed: boolean, mastery?: boolean, quizScore?: number): Promise<{ success: boolean }> => {
    const payload: { [key: string]: any } = { lessonId, completed };
    if (mastery !== undefined) payload.mastery = mastery;
    if (quizScore !== undefined) payload.quizScore = quizScore;
    
    return fetchWithAuth('/api/progress', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};
