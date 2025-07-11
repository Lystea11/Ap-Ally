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
      if (!ref.current || !code) return;

      // Clear any existing content
      ref.current.innerHTML = '';

      try {
        // Dynamically import mermaid on the client side
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ 
          startOnLoad: false, 
          theme: 'neutral',
          logLevel: 'error' // Reduce console noise
        });

        // Generate a unique ID for each diagram
        const id = `mermaid-svg-${Math.random().toString(36).substring(7)}`;
        
        // Validate the code before rendering
        if (!code.trim()) {
          throw new Error('Empty diagram code');
        }

        const { svg } = await mermaid.render(id, code);
        
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (error) {
        console.warn('Mermaid rendering error:', error);
        if (ref.current) {
          // Display a cleaner error message
          ref.current.innerHTML = `
            <div class="p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm">
              <span class="font-medium">Diagram unavailable</span>
              <p class="mt-1">This diagram could not be rendered due to a formatting issue.</p>
            </div>
          `;
        }
      }
    };

    renderMermaid();
  }, [code]);

  return <div ref={ref} className="mermaid not-prose" />;
}