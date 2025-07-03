# **App Name**: AP Ally

## Core Features:

- Landing Page: Landing Page with clear Call to Action buttons for Sign Up and Sign In.
- Onboarding Survey: Multi-step Onboarding survey to collect user data: AP Course Selection, Experience Level Input and GPT-Generated Quiz. Uses mocked AuthContext.
- Personalized Roadmap Generation: Generate personalized study roadmap, tool determines relevant learning objectives.
- Roadmap Display: Display the roadmap as a series of nested units and lessons, rendered from JSON with RoadmapViewer.tsx.
- Lesson & Lecture Viewer: LessonViewer.tsx component renders lesson content with practice questions, while LectureViewer.tsx presents structured lecture content.
- Progress Tracker: A dashboard page which will hold the study roadmap and can display a visual progress tracker, utilizing ProgressTracker.tsx, including per-lesson completion status and overall progress.
- Authentication: Mocked Authentication Context handles user login/logout state.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5), evoking intellect, focus, and trust; fitting for educational content.
- Background color: Light grayish-blue (#F0F4FF), very slightly desaturated, creating a calm and clean learning environment.
- Accent color: Soft violet (#9575CD), analogous to indigo but distinct, to highlight interactive elements.
- Body font: 'Inter', a sans-serif font, for readability and a clean modern user interface.
- Headline font: 'Space Grotesk', a sans-serif font, use to capture a more high tech design for the headings.
- Consistent use of academic-themed icons, with visual metaphors to help the user more easily and quickly grok each topic.
- Responsive design, optimized for both desktop and mobile viewing.