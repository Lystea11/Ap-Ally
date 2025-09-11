// src/lib/guest-session.ts

export interface GuestOnboardingData {
  formData: {
    apCourse: string;
    testDate?: Date;
    customDescription?: string;
  };
  quizData?: any;
  quizAnswers?: string;
  roadmap?: any;
  isCustomFlow?: boolean;
  timestamp?: number;
}

const GUEST_DATA_KEY = 'guestOnboardingData';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export class GuestSessionManager {
  static saveData(data: Partial<GuestOnboardingData>): void {
    try {
      const existingData = this.getData();
      const updatedData: GuestOnboardingData = { 
        ...existingData, 
        ...data, 
        timestamp: Date.now() 
      };
      localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to save guest data:', error);
    }
  }

  static getData(): GuestOnboardingData | null {
    try {
      const storedData = localStorage.getItem(GUEST_DATA_KEY);
      if (!storedData) return null;

      const data: GuestOnboardingData = JSON.parse(storedData);
      
      // Check if data has expired
      if (data.timestamp && Date.now() - data.timestamp > MAX_AGE_MS) {
        this.clearData();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to parse guest data:', error);
      this.clearData();
      return null;
    }
  }

  static clearData(): void {
    try {
      localStorage.removeItem(GUEST_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear guest data:', error);
    }
  }

  static hasValidData(): boolean {
    const data = this.getData();
    return data !== null && data.roadmap !== undefined;
  }

  static isExpired(): boolean {
    try {
      const storedData = localStorage.getItem(GUEST_DATA_KEY);
      if (!storedData) return true;

      const data: GuestOnboardingData = JSON.parse(storedData);
      return data.timestamp ? Date.now() - data.timestamp > MAX_AGE_MS : true;
    } catch (error) {
      return true;
    }
  }

  // Helper method for transferring guest data to authenticated user
  static async transferToUser(userId: string, createClassFn: (course: string, testDate?: string) => Promise<any>): Promise<string | null> {
    const guestData = this.getData();
    if (!guestData || !guestData.roadmap) return null;

    try {
      // Create the class for the authenticated user
      const newClass = await createClassFn(
        guestData.formData.apCourse,
        guestData.formData.testDate?.toISOString()
      );

      // If there's quiz data, save it to the database
      if (guestData.quizData && guestData.quizAnswers) {
        await fetch('/api/onboarding-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userUid: userId,
            apClassId: newClass.id,
            quizData: guestData.quizData,
            answers: guestData.quizAnswers
          })
        });
      }

      // Clear guest data after successful transfer
      this.clearData();

      return newClass.id;
    } catch (error) {
      console.error('Failed to transfer guest data:', error);
      throw error;
    }
  }
}