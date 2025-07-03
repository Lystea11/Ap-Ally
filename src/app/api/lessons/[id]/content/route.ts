import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';
import { cache } from '@/lib/cache';
import { generateLessonContent } from '@/ai/flows/generate-lesson-content';

async function handler(req: NextRequest, context: AuthenticatedContext) {
  const { id } = context.params;
  const { uid } = context.user;

  // 1. Check cache first
  const cacheKey = `user:${uid}:lesson:${id}:content`;
  if (cache.has(cacheKey)) {
    const cachedContent = cache.get(cacheKey);
    return NextResponse.json(cachedContent);
  }

  // 2. If not in cache, check database
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('title, content')
    .eq('id', id)
    .eq('user_uid', uid)
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  // If content already exists in DB, return and cache it
  if (lesson.content) {
    cache.set(cacheKey, lesson.content);
    return NextResponse.json(lesson.content);
  }

  // 3. If no content in DB, generate it using AI
  try {
    const generatedContent = await generateLessonContent({ topic: lesson.title });

    // 4. Store generated content in the database
    const { error: updateError } = await supabase
      .from('lessons')
      .update({ content: generatedContent })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to store lesson content:', updateError);
      // Proceed to return content even if DB update fails
    }

    // 5. Cache and return the new content
    cache.set(cacheKey, generatedContent);
    return NextResponse.json(generatedContent);
  } catch (aiError) {
    console.error('AI content generation failed:', aiError);
    return NextResponse.json({ error: 'Failed to generate lesson content' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
