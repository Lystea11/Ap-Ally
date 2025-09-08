// src/components/Countdown.tsx

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import type { APClass } from "@/lib/types";

interface CountdownProps {
  classes: APClass[];
}

export function Countdown({ classes }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<Record<string, number | null>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: Record<string, number | null> = {};
      classes.forEach((apClass) => {
        if (apClass.test_date) {
          const testDate = new Date(apClass.test_date).getTime();
          const now = new Date().getTime();
          const difference = testDate - now;
          newTimeLeft[apClass.id] = difference > 0 ? difference : null;
        } else {
          newTimeLeft[apClass.id] = null;
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [classes]);

  const formatTime = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-xl">Test Countdown</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {classes.map((apClass) => (
          <div key={apClass.id} className="mb-4">
            <h3 className="font-semibold">{apClass.course_name}</h3>
            {timeLeft[apClass.id] !== null && timeLeft[apClass.id] !== undefined ? (
              <p className="text-lg text-primary">{formatTime(timeLeft[apClass.id]!)}</p>
            ) : (
              <p className="text-muted-foreground">No test date set.</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}