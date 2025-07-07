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
    .insert({ user_uid: uid, ap_class_id: ap_class_id })
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

    let roadmapId: string | null = null;
    let courseName: string = "AP Study Plan";

    if (classId) {
        // If a specific class is requested, find its roadmap.
        const { data, error } = await supabase
            .from('roadmaps')
            .select('id, ap_classes(course_name)')
            .eq('ap_class_id', classId)
            .eq('user_uid', uid)
            .single();

        if (error || !data) {
            return NextResponse.json(null);
        }
        roadmapId = data.id;
        courseName = (data.ap_classes as any).course_name;

    } else {
        // If no classId is provided, find the most recently created class and its roadmap.
        const { data: latestClass, error: latestClassError } = await supabase
            .from('ap_classes')
            .select('id, course_name, roadmaps(id)')
            .eq('user_uid', uid)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (latestClassError || !latestClass || latestClass.roadmaps.length === 0) {
            return NextResponse.json(null);
        }
        roadmapId = latestClass.roadmaps[0].id;
        courseName = latestClass.course_name;
    }

    if (!roadmapId) {
        return NextResponse.json(null);
    }

    // Now fetch the lessons for the determined roadmapId.
    const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('user_uid', uid)
        .eq('roadmap_id', roadmapId)
        .order('unit_order', { ascending: true })
        .order('lesson_order', { ascending: true });
    
    if (lessonsError) {
        console.error('Failed to fetch lessons:', lessonsError);
        return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }
    
    // Reconstruct the single roadmap from the flat lesson list
    const reconstructedRoadmap: { title: string, units: any[] } = { title: courseName, units: [] };
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