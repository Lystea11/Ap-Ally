
"use client";

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  code: string;
}

// Generate a unique ID for each diagram
let idCounter = 0;
const generateId = () => `mermaid-diagram-${idCounter++}`;

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = generateId();

  useEffect(() => {
    mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
    if (ref.current) {
        // Ensure the code is not empty before trying to render
        if(code) {
          mermaid.render(id, code, (svgCode) => {
            if (ref.current) {
              ref.current.innerHTML = svgCode;
            }
          });
        }
    }
  }, [code, id]);

  return <div ref={ref} key={id} className="mermaid">{code}</div>;
}