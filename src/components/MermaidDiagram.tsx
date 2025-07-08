// src/components/MermaidDiagram.tsx
"use client";

import { useEffect, useRef } from 'react';

interface MermaidDiagramProps {
  code: string;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderMermaid = async () => {
      // Dynamically import mermaid on the client side
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' });

      if (ref.current && code) {
        try {
          // Generate a unique ID for each diagram
          const id = `mermaid-svg-${Math.random().toString(36).substring(7)}`;
          const { svg } = await mermaid.render(id, code);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (ref.current) {
            // Display an error message in the UI
            ref.current.innerHTML = `Error rendering diagram.`;
          }
        }
      }
    };

    renderMermaid();
  }, [code]);

  return <div ref={ref} className="mermaid not-prose" />;
}