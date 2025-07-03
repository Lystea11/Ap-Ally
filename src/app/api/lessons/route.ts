import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const createRoadmapSchema = z.object({
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
  const { courseName, units } = parseResult.data;

  // Create roadmap entry
  const { data: roadmapData, error: roadmapError } = await supabase
    .from('roadmaps')
    .insert({ user_uid: uid, course_name: courseName })
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

export const POST = withAuth(createRoadmapHandler);


/**
 * API endpoint to retrieve all lessons for the current user, structured as a roadmap.
 */
async function getLessonsHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;

  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('user_uid', uid)
    .order('unit_order', { ascending: true })
    .order('lesson_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch lessons:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }

  // Reconstruct roadmap structure from flat lesson list
  const roadmaps: Record<string, { title: string, units: any[] }> = {};

  const { data: roadmapMetas } = await supabase.from('roadmaps').select('id, course_name').eq('user_uid', uid);

  for (const lesson of lessons) {
    const roadmapMeta = roadmapMetas?.find(r => r.id === lesson.roadmap_id);
    if (!roadmapMeta) continue;

    const roadmapTitle = roadmapMeta.course_name;
    if (!roadmaps[lesson.roadmap_id]) {
        roadmaps[lesson.roadmap_id] = { title: roadmapTitle, units: [] };
    }

    let unit = roadmaps[lesson.roadmap_id].units.find(u => u.title === lesson.unit_title);
    if (!unit) {
      unit = { id: `unit-${lesson.unit_order}`, title: lesson.unit_title, lessons: [] };
      roadmaps[lesson.roadmap_id].units.push(unit);
    }
    
    unit.lessons.push({
      id: lesson.id,
      title: lesson.title,
      completed: lesson.completed,
      mastery: lesson.mastery,
    });
  }

  // For this app, we usually deal with one roadmap at a time. Return the latest one.
  // A more advanced app might return all roadmaps.
  const latestRoadmap = Object.values(roadmaps)[0] || null;

  return NextResponse.json(latestRoadmap);
}

export const GET = withAuth(getLessonsHandler);
