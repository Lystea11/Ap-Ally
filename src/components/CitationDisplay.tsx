// src/components/CitationDisplay.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface Citation {
  id: string;
  course: string;
  chunkIndex: number;
  text: string;
  relevanceScore: number;
}

interface CitationDisplayProps {
  citations: Citation[];
  className?: string;
}

export function CitationDisplay({ citations, className = "" }: CitationDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <Card className={`mt-6 border-l-4 border-l-blue-500 ${className}`}>
      <CardHeader className="pb-3">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center justify-between w-full p-0 hover:bg-transparent"
            >
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                Sources ({citations.length} references)
              </CardTitle>
              <ExternalLink className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <CardContent className="space-y-3 p-0">
              {citations.map((citation) => (
                <div 
                  key={citation.id}
                  className="flex flex-col space-y-2 p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {citation.id}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        {citation.course}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Section {citation.chunkIndex}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-muted-foreground">
                        {(citation.relevanceScore * 100).toFixed(0)}% match
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {citation.text}
                  </p>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}