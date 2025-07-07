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
        throw new Error(errorData.error || 'An unknown error occurred');
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