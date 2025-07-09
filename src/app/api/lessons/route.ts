// src/app/api/lessons/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const createRoadmapSchema = z.object({
  ap_class_id: z.string().uuid(),
  courseName: z.string(),
  units: z.array(
    z.object({
      title: z.string(),
      lessons: z.array(
        z.object({
          title: z.string(),
        })
      ),
    })
  ),
});

/**
 * API endpoint to create a new roadmap and all its associated lessons for a user.
 */
async function createRoadmapHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const body = await req.json();

  const parseResult = createRoadmapSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parseResult.error.flatten() }, { status: 400 });
  }
  const { ap_class_id, courseName, units } = parseResult.data;

  // Create roadmap entry
  const { data: roadmapData, error: roadmapError } = await supabase
    .from('roadmaps')
    .insert({ user_uid: uid, ap_class_id: ap_class_id, course_name: courseName })
    .select('id')
    .single();

  if (roadmapError || !roadmapData) {
    console.error('Failed to create roadmap:', roadmapError);
    return NextResponse.json({ error: 'Failed to create roadmap' }, { status: 500 });
  }

  // Prepare lessons for batch insert
  const lessonsToInsert = units.flatMap((unit, unitIndex) =>
    unit.lessons.map((lesson, lessonIndex) => ({
      roadmap_id: roadmapData.id,
      user_uid: uid,
      unit_title: unit.title,
      title: lesson.title,
      unit_order: unitIndex,
      lesson_order: lessonIndex,
    }))
  );

  const { error: lessonsError } = await supabase.from('lessons').insert(lessonsToInsert);

  if (lessonsError) {
    console.error('Failed to create lessons:', lessonsError);
    // TODO: Consider deleting the created roadmap entry for consistency
    return NextResponse.json({ error: 'Failed to create lessons' }, { status: 500 });
  }

  return NextResponse.json({ success: true, roadmapId: roadmapData.id }, { status: 201 });
}

export const POST = await withAuth(createRoadmapHandler);


/**
 * API endpoint to retrieve all lessons for the current user, structured as a roadmap.
 */
async function getLessonsHandler(req: NextRequest, context: AuthenticatedContext) {
    const { uid } = context.user;
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');

    if (!classId) {
        return NextResponse.json({error: "classId is required"}, {status: 400});
    }

    // A single query to get the class, its roadmap, and all its lessons.
    const { data: apClass, error } = await supabase
        .from('ap_classes')
        .select(`
            id,
            course_name,
            roadmaps (
                id,
                lessons (
                    id,
                    title,
                    completed,
                    mastery,
                    unit_title,
                    unit_order,
                    lesson_order
                )
            )
        `)
        .eq('id', classId)
        .eq('user_uid', uid)
        .single();
    
    if (error || !apClass || !apClass.roadmaps || apClass.roadmaps.length === 0) {
        return NextResponse.json(null);
    }
    
    const roadmap = apClass.roadmaps[0];
    const lessons = roadmap.lessons.sort((a,b) => a.unit_order - b.unit_order || a.lesson_order - b.lesson_order);
    
    // Reconstruct the single roadmap from the flat lesson list
    const reconstructedRoadmap: { id: string, title: string, units: any[] } = { 
        id: apClass.id, 
        title: apClass.course_name, 
        units: [] 
    };
    const unitMap = new Map<string, any>();

    for (const lesson of lessons) {
        if (!unitMap.has(lesson.unit_title)) {
            unitMap.set(lesson.unit_title, {
                id: `unit-${lesson.unit_order}`,
                title: lesson.unit_title,
                lessons: [],
            });
        }
        
        unitMap.get(lesson.unit_title)!.lessons.push({
            id: lesson.id,
            title: lesson.title,
            completed: lesson.completed,
            mastery: lesson.mastery,
        });
    }

    reconstructedRoadmap.units = Array.from(unitMap.values());
    
    return NextResponse.json(reconstructedRoadmap);
}

export const GET = await withAuth(getLessonsHandler);