
import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).renderMathInElement) {
      (window as any).renderMathInElement(containerRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    } else if (containerRef.current) {
        // Fallback for environment where auto-render might not be global
        // We'll just rely on basic text rendering if katex isn't fully loaded yet
        // In a real app we'd load it properly as a module
    }
  }, [content]);

  // Basic markdown-to-html conversion for simple things like line breaks
  const formattedContent = content.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <div ref={containerRef} className={`prose max-w-none text-slate-700 ${className}`}>
      {formattedContent}
    </div>
  );
};

export default MathRenderer;
