// src/app/(authenticated)/lesson/[lessonId]/page.tsx

import ClientLessonPage from './ClientLessonPage';

export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const lessonId = (await Promise.resolve(params)).lessonId;
  return <ClientLessonPage lessonId={lessonId} />;
}