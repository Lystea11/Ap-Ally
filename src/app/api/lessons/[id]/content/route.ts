// src/app/api/lessons/[id]/content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';
import { generateLessonContent } from '@/ai/flows/generate-lesson-content';
import { cache } from '@/lib/cache';

async function getLessonContentHandler(req: NextRequest, context: AuthenticatedContext) {
    const params = await context.params; // Correctly await the params
    const { id } = params;
    const { uid } = context.user;
    

    // First, verify the user has access to this lesson
    const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('id, title, roadmap_id')
        .eq('id', id)
        .eq('user_uid', uid)
        .single();

    if (lessonError || !lesson) {
        return NextResponse.json({ error: 'Lesson not found or you do not have access.' }, { status: 404 });
    }

    // Check cache first
    const cachedContent = cache.get(id);
    if (cachedContent) {
        return NextResponse.json(cachedContent);
    }

    // If not in cache, generate it
    try {
        const generatedContent = await generateLessonContent({ topic: lesson.title });

        // Store the generated content in the cache
        cache.set(id, generatedContent);
        
        // NEW CODE: Update the content column in the lessons table
        const { error: updateError } = await supabase
            .from('lessons')
            .update({ content: generatedContent })
            .eq('id', id)
            .eq('user_uid', uid);
            
        if (updateError) {
            console.error('Failed to update lesson content in database:', updateError);
            // Continue anyway since we have the content in memory
        }

        return NextResponse.json(generatedContent);
    } catch (error) {
        console.error('Failed to generate lesson content:', error);
        return NextResponse.json({ error: 'Failed to generate lesson content' }, { status: 500 });
    }
}

export const GET = await withAuth(getLessonContentHandler);