import React from 'react';

export const BootScreen = () => {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono text-green-500 z-50">
      <div className="w-64 mb-4">
        <div className="h-1 bg-gray-900 rounded-full overflow-hidden">
          <div className="h-full bg-green-600 animate-[widthGrow_1.5s_ease-out_forwards]" style={{width: '0%'}}></div>
        </div>
        <style>{`@keyframes widthGrow { to { width: 100%; } }`}</style>
      </div>
      <div className="text-xs space-y-1 text-center">
        <p className="animate-pulse">INITIALIZING PROJECT XAEL...</p>
        <p className="opacity-70 uppercase">Loading Neural Pathways... OK</p>
        <p className="opacity-30">WELCOME USER.</p>
      </div>
    </div>
  );
};
