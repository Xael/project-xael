import React, { useState, useEffect } from 'react';

export const MatrixTitle = () => {
  const [glitchText, setGlitchText] = useState('PROJECT_XAEL');
  const target = 'PROJECT_XAEL';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*';

  useEffect(() => {
    let iterations = 0;
    const interval = setInterval(() => {
      setGlitchText(prev => 
        target.split('').map((char, index) => {
          if (index < iterations) return target[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('')
      );
      if (iterations >= target.length) clearInterval(interval);
      iterations += 1/3; 
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center p-8 bg-black/80 backdrop-blur-xl rounded-2xl border border-green-900/30 shadow-2xl">
      <div className="font-mono text-[10px] text-green-700/80 mb-1 tracking-widest animate-pulse">
        SYSTEM.ROOT(0x14F)
      </div>
      <h1 className="text-4xl md:text-6xl font-mono font-bold text-green-500 tracking-tighter" 
          style={{ textShadow: '0 0 15px rgba(34, 197, 94, 0.6)' }}>
        {glitchText}<span className="animate-[blink_1s_infinite]">_</span>
      </h1>
      <div className="font-mono text-[10px] text-green-700/80 mt-1 tracking-[0.5em] opacity-70">
        DIGITAL_ARCHIVE_V4
      </div>
    </div>
  );
};
