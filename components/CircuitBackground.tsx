import React from 'react';

export const CircuitBackground = () => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="glow-trace">
          <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Exemplo de uma linha de energia */}
      <g>
        <path d="M 10 10 L 40 10 L 40 50 L 90 50" className="stroke-green-900/20 fill-none stroke-[0.2]" />
        <path d="M 10 10 L 40 10 L 40 50 L 90 50" className="stroke-green-400 fill-none stroke-[0.4]" 
              strokeDasharray="5 100" filter="url(#glow-trace)">
          <animate attributeName="stroke-dashoffset" from="105" to="-105" dur="5s" repeatCount="indefinite" />
        </path>
      </g>
      
      {/* Você pode adicionar mais <path> com coordenadas diferentes para criar o circuito completo */}
    </svg>
  );
};
