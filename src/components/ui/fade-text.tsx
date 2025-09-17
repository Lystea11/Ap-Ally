import React from 'react';
import { cn } from '@/lib/utils';

interface FadeTextProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
  fadeLength?: string;
}

export function FadeText({
  children,
  className,
  maxWidth = "100%",
  fadeLength = "20px"
}: FadeTextProps) {
  const maskStyle = {
    WebkitMaskImage: `linear-gradient(to left, transparent, black ${fadeLength})`,
    maskImage: `linear-gradient(to left, transparent, black ${fadeLength})`,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat'
  };

  return (
    <div
      className={cn("overflow-hidden whitespace-nowrap", className)}
      style={{ maxWidth, ...maskStyle }}
    >
      {children}
    </div>
  );
}