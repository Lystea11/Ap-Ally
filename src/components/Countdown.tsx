// src/components/Countdown.tsx

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { APClass } from "@/lib/types";
import { FadeText } from "@/components/ui/fade-text";

interface CountdownProps {
  classes: APClass[];
}

interface TimeUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({ classes }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<Record<string, TimeUnits | null>>({});
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: Record<string, TimeUnits | null> = {};
      classes.forEach((apClass) => {
        if (apClass.test_date) {
          const testDate = new Date(apClass.test_date).getTime();
          const now = new Date().getTime();
          const difference = testDate - now;
          if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            newTimeLeft[apClass.id] = { days, hours, minutes, seconds };
          } else {
            newTimeLeft[apClass.id] = null;
          }
        } else {
          newTimeLeft[apClass.id] = null;
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [classes]);

  const formatCompactTime = (time: TimeUnits) => {
    if (time.days > 0) return `${time.days}d ${time.hours}h`;
    if (time.hours > 0) return `${time.hours}h ${time.minutes}m`;
    return `${time.minutes}m ${time.seconds}s`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Test Countdown</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {classes.map((apClass) => {
          const time = timeLeft[apClass.id];
          const totalDays = time?.days ?? 0;
          const isUrgent = totalDays <= 7 && totalDays > 3;
          const isCritical = totalDays <= 3;
          
          return (
            <div 
              key={apClass.id} 
              className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => router.push(`/dashboard/${apClass.id}`)}
            >
              <FadeText className="text-sm font-medium">{apClass.course_name}</FadeText>
              <div className="flex items-center gap-2">
                {time ? (
                  <>
                    <span className={`text-xs font-mono ${
                      isCritical ? 'text-red-600' :
                      isUrgent ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {formatCompactTime(time)}
                    </span>
                    {isCritical && (
                      <span className="text-xs px-1 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                        !
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">No date</span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}