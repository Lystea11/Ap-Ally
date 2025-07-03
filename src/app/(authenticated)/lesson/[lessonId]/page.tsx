// app/(authenticated)/lesson/[lessonId]/page.tsx

import ClientLessonPage from './ClientLessonPage';

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  return <ClientLessonPage params={params} />;
}


